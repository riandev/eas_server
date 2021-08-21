const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectID = require("mongodb").ObjectID;
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");

const app = express();
app.use(express.static("../eas_client/build"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false, limit: "5000mb" }));
app.use(bodyParser.json({ limit: "5000mb" }));
const port = 5004;

const MongoClient = require("mongodb").MongoClient;
// const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1:27017/aktcl_eas";
// const uri =
//   "mongodb+srv://aktcl:01939773554op5t@cluster0.9akoo.mongodb.net/aktcl_cep?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const userCollection = client.db("aktcl_eas").collection("users");
  const adminCollection = client.db("aktcl_eas").collection("admins");
  const leadsCollection = client.db("aktcl_eas").collection("leads");
  const reportDatasCollection = client
    .db("aktcl_eas")
    .collection("report_origin_datas");
  const detailsReportCollection = client
    .db("aktcl_eas")
    .collection("detailsReport");
  const tmsTmrCollection = client.db("aktcl_eas").collection("tms_tmr_report");
  const territoryReportCollection = client
    .db("aktcl_eas")
    .collection("territoryReport");
  console.log("user Connection");
  app.get("/agent", (req, res) => {
    const email = req.query.email;
    console.log(email);
    userCollection.find({ email: email }).toArray((err, agents) => {
      console.log(agents[0]);
      res.send(agents[0]);
    });
  });
  app.get("/admin", (req, res) => {
    const email = req.query.email;
    console.log(email);
    adminCollection.find({ email: email }).toArray((err, admins) => {
      console.log(admins[0]);
      res.send(admins[0]);
    });
  });
  app.get("/dMatched/:Consumer_No", (req, res) => {
    const for_d = "d";
    leadsCollection.find({ for_d: for_d }).toArray((err, d) => {
      const Consumer_No = parseInt(req.params.Consumer_No);
      const dNumber = d.find((dOut) => dOut.Consumer_No === Consumer_No);
      console.log(dNumber);
      res.send(dNumber);
    });
  });
  app.patch("/answers/:id", (req, res) => {
    const answers = req.body;
    console.log(answers);
    const id = ObjectID(req.params.id);
    leadsCollection
      .updateOne(
        { _id: id },
        {
          $set: {
            answer1: answers.ans1,
            answer2: answers.ans2,
            answer3: answers.ans3,
            answer4: answers.ans4,
            answer5: answers.ans5,
            answer6: answers.ans6,
            answer7: answers.ans7,
            answer8: answers.ans8,
            answer9: answers.ans9,
            answer10: answers.ans10,
            answer11: answers.ans11,
            agentID: answers.agentID,
            callDate: answers.callDate,
            callTime: answers.callTime,
          },
        }
      )
      .then((result) => {
        console.log(result);
      });
  });
  app.get("/reports", (req, res) => {
    leadsCollection.find({}).toArray((err, reports) => {
      res.send(reports);
    });
  });
  app.get("/qc/:number", (req, res) => {
    const number = req.params.number;
    leadsCollection.find({ Consumer_No: number }).toArray((err, qcs) => {
      console.log(qcs);
      res.send(qcs);
    });
  });
  app.get("/update/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    leadsCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, update) => {
        console.log(update);
        res.send(update);
      });
  });
  app.delete("/deleteAll", (req, res) => {
    leadsCollection.deleteMany({}).then((result) => {
      console.log(result);
      res.send(result.deletedCount > 0);
    });
  });
  app.patch("/finalUpdate/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    const update = req.body;
    console.log(id);
    leadsCollection
      .updateOne(
        { _id: id },
        {
          $set: {
            answer1: update.answer1,
            answer2: update.answer2,
            answer3: update.answer3,
            answer4: update.answer4,
            answer5: update.answer5,
            answer6: update.answer6,
            answer7: update.answer7,
            answer8: update.answer8,
            answer9: update.answer9,
            answer10: update.answer10,
            answer11: update.answer11,
            qcChecked: update.qcChecked,
            remarks: update.remarks,
            rating: update.rating,
            qcDate: update.qcDate,
            qcTime: update.qcTime,
          },
        }
      )
      .then((result) => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      });
  });
  app.get("/finalReportLead", (req, res) => {
    leadsCollection.find({}).toArray((err, finalLeads) => {
      console.log(finalLeads);
      res.send(finalLeads);
    });
  });
  app.post("/uploadLead", (req, res) => {
    const leadData = req.body;
    console.log(leadData);
    leadsCollection.insertMany(leadData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/adminSignUp", (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/reportsData", (req, res) => {
    const detailsReports = req.body;
    console.log(detailsReports);
    detailsReportCollection.insertMany(detailsReports).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/reportDates", async (req, res) => {
    async function analyzeData() {
      let result = [];
      try {
        let data = await leadsCollection.find({}).toArray();
        let dates = _.groupBy(JSON.parse(JSON.stringify(data)), function (d) {
          return d.data_date;
        });
        for (date in dates) {
          result.push({
            date: date,
          });
        }
      } catch (e) {
        console.log(e.message);
      }
      res.send(result);
    }
    analyzeData();
  });
  app.get("/prepareByDate", (req, res) => {
    let pDate = req.query;
    console.log(pDate.date);
    leadsCollection.find({ data_date: pDate?.date }).toArray((err, result) => {
      res.send(result);
    });
  });
  app.delete("/deleteByDate", (req, res) => {
    let pDate = req.query;
    console.log(pDate.date);
    leadsCollection.deleteMany({ data_date: pDate.date }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
  app.get("/initialLead", (req, res) => {
    let initDate = req.query.initDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              { for_d: null },
              { Data_Status: "Valid_Data" },
              { data_date: initDate },
            ],
          },
        },
      ])
      .toArray((err, results) => {
        let output = [];
        let users = _.groupBy(
          JSON.parse(JSON.stringify(results)),
          function (d) {
            return d.TM_USER_NAME;
          }
        );
        for (user in users) {
          output.push({
            // userId: user,
            // consumers: users[user],
            // countByUser: users[user].length,
            initLeads: users[user]
              .slice(0, Math.round((users[user].length * 25) / 100))
              .map((d) => {
                let datas = {};
                (datas.id = d._id),
                  (datas.diid = d.DIID),
                  (datas.data_date = d.data_date),
                  (datas.r_name = d.r_name),
                  (datas.Consumer_No = d.Consumer_No);
                return datas;
              }),
          });
        }
        res.send(output);
      });
  });
  app.patch("/updateInitialLead", async (req, res) => {
    const initialLead = req.body;
    console.log(initialLead);
    let buldOperation = [];
    let counter = 0;

    try {
      initialLead.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element.id) },
            update: {
              $set: {
                for_d: element.for_d,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  app.get("/regenerate", (req, res) => {
    const regenDate = req.query.regenDate;
    console.log(regenDate);
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [{ Data_Status: "Valid_Data" }, { data_date: regenDate }],
          },
        },
      ])
      .toArray((err, results) => {
        let output = [];
        let users = _.groupBy(
          JSON.parse(JSON.stringify(results)),
          function (d) {
            return d.TM_USER_NAME;
          }
        );
        for (user in users) {
          output.push({
            // userId: user,
            // consumers: users[user],
            // countByUser: users[user].length,
            // callDone: users[user].filter(
            //   (x) => x.answer1 === "yes" || x.answer1 === "no"
            // ).length,
            newLead: users[user]
              .filter(
                (x) =>
                  x.for_d === null &&
                  (x.answer1 === null || x.answer1 === undefined)
              )
              .slice(
                0,
                users[user].filter(
                  (x) => x.answer1 === "yes" || x.answer1 === "no"
                ).length < 6
                  ? 6 -
                      users[user].filter(
                        (x) => x.answer1 === "yes" || x.answer1 === "no"
                      ).length
                  : 0
              )
              .map((d) => {
                let datas = {};
                (datas.id = d._id),
                  (datas.diid = d.DIID),
                  (datas.data_date = d.data_date),
                  (datas.r_name = d.r_name),
                  (datas.Consumer_No = d.Consumer_No);
                return datas;
              }),
          });
        }
        res.send(output);
      });
  });
  app.patch("/regenerateUpdate", async (req, res) => {
    const regenerateLead = req.body;
    console.log(regenerateLead);
    let buldOperation = [];
    let counter = 0;

    try {
      regenerateLead.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element.id) },
            update: {
              $set: {
                for_d: element.for_d,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Report Panel Start
  app.get("/updateConnectCall", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [{ answer1: "yes" }, { answer1: "no" }],
              },
            ],
          },
        },
      ])
      .toArray((err, results) => {
        res.send(results);
      });
  });

  app.get("/getTrueContact", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              { answer1: "yes" },
              { answer2: "yes" },
              { answer6: "yes" },
              { answer7: "marise" },
              { data_date: reportDate },
            ],
          },
        },
      ])
      .toArray((err, trueContact) => {
        res.send(trueContact);
      });
  });
  app.get("/nonSOB1", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer3: "others" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [
                  { answer4: "4days" },
                  { answer4: "5days" },
                  { answer4: "6days" },
                  { answer4: "7days" },
                  { answer4: "8days" },
                  { answer4: "9days" },
                  { answer4: "10days" },
                  { answer4: "11days" },
                  { answer4: "12days" },
                  { answer4: "13days" },
                  { answer4: "14days" },
                  { answer4: "15days" },
                  { answer4: "3week" },
                  { answer4: "1month" },
                  { answer4: "2month" },
                  { answer4: "3month" },
                  { answer4: "4month" },
                  { answer4: "5month" },
                  { answer4: "6month" },
                  { answer4: "1year" },
                  { answer4: "1yearplus" },
                ],
              },
            ],
          },
        },
      ])
      .toArray((err, nonSOB1) => {
        res.send(nonSOB1);
      });
  });
  app.get("/nonSOB2", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer3: "others" }, { answer3: "marise" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [
                  { answer4: "1days" },
                  { answer4: "2days" },
                  { answer4: "3days" },
                ],
              },
              {
                $or: [{ answer5: "others" }],
              },
            ],
          },
        },
      ])
      .toArray((err, nonSOB2) => {
        res.send(nonSOB2);
      });
  });
  app.get("/extMSB", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer3: "marise" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [
                  { answer4: "4days" },
                  { answer4: "5days" },
                  { answer4: "6days" },
                  { answer4: "7days" },
                  { answer4: "8days" },
                  { answer4: "9days" },
                  { answer4: "10days" },
                  { answer4: "11days" },
                  { answer4: "12days" },
                  { answer4: "13days" },
                  { answer4: "14days" },
                  { answer4: "15days" },
                  { answer4: "3week" },
                  { answer4: "1month" },
                  { answer4: "2month" },
                  { answer4: "3month" },
                  { answer4: "4month" },
                  { answer4: "5month" },
                  { answer4: "6month" },
                  { answer4: "1year" },
                  { answer4: "1yearplus" },
                ],
              },
            ],
          },
        },
      ])
      .toArray((err, extMSB) => {
        res.send(extMSB);
      });
  });
  app.get("/notContacted1", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer1: "no" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, notContacted1) => {
        res.send(notContacted1);
      });
  });
  app.get("/notContacted2", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer2: "no" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, notContacted2) => {
        res.send(notContacted2);
      });
  });
  app.get("/notContacted3", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer6: "no" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, notContacted3) => {
        res.send(notContacted3);
      });
  });
  app.get("/notContacted4", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer7: "others" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, notContacted4) => {
        res.send(notContacted4);
      });
  });
  app.get("/finalNotContacted", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { notContacteda: 1 },
                  { notContactedb: 1 },
                  { notContactedc: 1 },
                  { notContactedd: 1 },
                ],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, finalNotContacted) => {
        res.send(finalNotContacted);
      });
  });
  // app.get("/finalNotContacted2", (req, res) => {
  //   finalReport.aggregate.toArray((err, finalNotContacted2) => {
  //     res.send(finalNotContacted2);
  //   });
  // });
  //Final Not Contacted
  app.get("/pureNotContacted", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ notContacted: 1 }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [{ nonSOB1: 1 }, { nonSOB2_Final: 1 }, { extMSB: 1 }],
              },
            ],
          },
        },
      ])
      .toArray((err, pureNotContacted) => {
        res.send(pureNotContacted);
      });
  });
  // Final True Contact
  // app.get("/finalTrueContact", (req, res) => {
  //   finalReport
  //     .aggregate([
  //       {
  //         $match: {
  //           $or: [{ trueContact: 1 }],
  //         },
  //       },
  //     ])
  //     .toArray((err, finalTrueContact) => {
  //       res.send(finalTrueContact);
  //     });
  // });
  app.get("/falseContact", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { notContacted: 1 },
                  { nonSOB1: 1 },
                  { nonSOB2_Final: 1 },
                  { extMSB: 1 },
                ],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, falseContact) => {
        res.send(falseContact);
      });
  });
  // app.get("/finalFalseContact", (req, res) => {
  //   finalReport
  //     .aggregate([
  //       {
  //         $match: {
  //           $or: [{ falseContactFinal: 1 }],
  //         },
  //       },
  //     ])
  //     .toArray((err, falseContact) => {
  //       res.send(falseContact);
  //     });
  // });
  app.get("/verifyFalseContact", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              { trueContact: 1 },
              { falseContactFinal: 1 },
              { data_date: reportDate },
            ],
          },
        },
      ])
      .toArray((err, verifyFalseContact) => {
        res.send(verifyFalseContact);
      });
  });
  app.get("/noFreeSample", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [{ answer9: 0 }, { data_date: reportDate }],
          },
        },
      ])
      .toArray((err, noFreeSample) => {
        res.send(noFreeSample);
      });
  });
  app.get("/lessFreeSample", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer9: 1 }, { answer9: 2 }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, lessFreeSample) => {
        res.send(lessFreeSample);
      });
  });
  app.get("/teaSnaks", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer11: "no" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
            ],
          },
        },
      ])
      .toArray((err, teaSnaks) => {
        res.send(teaSnaks);
      });
  });
  app.get("/retention", (req, res) => {
    const reportDate = req.query.reportDate;
    leadsCollection
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ answer3: "marise" }],
              },
              {
                $or: [{ data_date: reportDate }],
              },
              {
                $or: [
                  { answer4: "1days" },
                  { answer4: "2days" },
                  { answer4: "3days" },
                ],
              },
              {
                $or: [
                  { answer5: "derby" },
                  { answer5: "hollywood" },
                  { answer5: "pilot" },
                  { answer5: "royals" },
                  { answer5: "sheikh" },
                  { answer5: "k2" },
                  { answer5: "real" },
                ],
              },
            ],
          },
        },
      ])
      .toArray((err, retention) => {
        res.send(retention);
      });
  });
  app.get("/finalReport", (req, res) => {
    finalReport.find({}).toArray((err, finalReport) => {
      res.send(finalReport);
    });
  });
  // Generate TMR/TMS Report
  app.get("/analyze_import", async (req, res) => {
    async function analyzeData() {
      let result = [];
      let valid_total = 0;
      let connected_total = 0;
      let true_total = 0;
      let notConnected_total = 0;
      let noSOB1_total = 0;
      let nonSOB2_total = 0;
      let extMSB_total = 0;
      let falseContact_total = 0;
      let noFreeSample_total = 0;
      let lessFreeSample_total = 0;
      let teaSnaks_total = 0;
      let retention_total = 0;
      let grandAvgExpense = 0;
      try {
        let data = await leadsCollection.find({}).toArray();
        let users = _.groupBy(JSON.parse(JSON.stringify(data)), function (d) {
          return d.TM_USER_NAME;
        });
        for (user in users) {
          result.push({
            userId: user,
            userName: users[user][0].TM_NAME,
            teritory: users[user][0].TERITORY_NAME,
            avgExpense: users[user][0].avgSalary,
            callDate: users[user][0].callDate,
            dataDate: users[user][0].data_date,
            consumerNumber: users[user][0].Consumer_No,
            territoryID: users[user][0].TERRITORY_ID,
            tmContactNo: users[user][0].TM_CONTACT_NO,
            callDate1: users[user][0].callDate1,
            valid_Data_count: users[user].filter(
              (x) => x.Data_Status === "Valid_Data"
            ).length,
            connected_Call_count: users[user].filter(
              (x) => x.connectedCall === 1
            ).length,
            true_Contact_count: users[user].filter((x) => x.trueContact === 1)
              .length,
            not_Contacted_count: users[user].filter((x) => x.notContacted === 1)
              .length,
            non_SOB1_count: users[user].filter((x) => x.nonSOB1 === 1).length,
            non_SOB2_count: users[user].filter((x) => x.nonSOB2_Final === 1)
              .length,
            ext_MSB_count: users[user].filter((x) => x.extMSB === 1).length,
            false_Contact_count: users[user].filter(
              (x) => x.falseContactFinal === 1
            ).length,
            no_Free_Sample: users[user].filter((x) => x.noFreeSample === 1)
              .length,
            less_Free_Sample: users[user].filter((x) => x.lessFreeSample === 1)
              .length,
            teaSnaks: users[user].filter((x) => x.teaSnaks === 1).length,
            retention: users[user].filter((x) => x.retention === 1).length,
            target: 25,
            targetTrueContact: 15,
            sumAvgExpense: users[user]
              .filter((x) => x.avgSalary)
              .map((x) => Number(x.avgSalary))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
          });
          valid_total += users[user].filter(
            (x) => x.Data_Status === "Valid_Data"
          ).length;
          connected_total += users[user].filter(
            (x) => x.connectedCall === 1
          ).length;
          true_total += users[user].filter((x) => x.trueContact === 1).length;
          notConnected_total += users[user].filter(
            (x) => x.notContacted === 1
          ).length;
          noSOB1_total += users[user].filter((x) => x.nonSOB1 === 1).length;
          nonSOB2_total += users[user].filter(
            (x) => x.nonSOB2_Final === 1
          ).length;
          extMSB_total += users[user].filter((x) => x.extMSB === 1).length;
          falseContact_total += users[user].filter(
            (x) => x.falseContactFinal === 1
          ).length;
          noFreeSample_total += users[user].filter(
            (x) => x.noFreeSample === 1
          ).length;
          lessFreeSample_total += users[user].filter(
            (x) => x.lessFreeSample === 1
          ).length;
          teaSnaks_total += users[user].filter((x) => x.teaSnaks === 1).length;
          retention_total += users[user].filter(
            (x) => x.retention === 1
          ).length;
          grandAvgExpense += users[user]
            .filter((x) => x.avgSalary)
            .map((x) => Number(x.avgSalary))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
        }
        console.log("Total Data", data.length);
        console.log("Unique Users", result);
        result = result.map((r) => {
          return {
            ...r,
            valid_total,
            connected_total,
            true_total,
            notConnected_total,
            noSOB1_total,
            nonSOB2_total,
            extMSB_total,
            falseContact_total,
            noFreeSample_total,
            lessFreeSample_total,
            teaSnaks_total,
            retention_total,
            grandAvgExpense,
          };
        });
        insertResult(result);
      } catch (e) {
        console.log(e.message);
      }
    }

    async function insertResult(data) {
      try {
        await tmsTmrCollection.deleteMany({});
        await tmsTmrCollection.insertMany(JSON.parse(JSON.stringify(data)));
        console.log("Inserted");
        res.send(true);
      } catch (e) {
        res.send("Error", e.message);
      }
    }
    analyzeData();
  });
  //Teritorry Reports
  app.post("/reportDatas", (req, res) => {
    let reportData = req.body;
    reportDatasCollection.deleteMany({});
    reportDatasCollection.insertMany(reportData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/territoryMinusReport", (req, res) => {
    const regenDate = req.query.regenDate;
    console.log(regenDate);
    reportDatasCollection
      .aggregate([
        {
          $match: {
            $and: [{ ChargeAmount: { $lt: 0 } }],
          },
        },
      ])
      .toArray((err, results) => {
        let output = [];
        let grandSumTarget = 0;
        let grandSumValidData = 0;
        let grandSumLessContacted = 0;
        let grandSumConnectedCall = 0;
        let grandSumTruelyConnected = 0;
        let grandSumNotConnected = 0;
        let grandSumWtgNonSOB = 0;
        let grandSumExtMSB = 0;
        let grandSumFalseContact = 0;
        let grandSumNoFreeSample = 0;
        let grandSumLessFreeSample = 0;
        let grandSumNoAndLessFreeSample = 0;
        let grandSumTeaSnacks = 0;
        let grandSumRetaination = 0;
        let grandSumTargetTrueContact = 0;
        let grandSumExtrapulatedData = 0;
        let grandSumLessMoreTrueContacted = 0;
        let grandAvgConsumerAmount = 0;
        let grandAvgConsumerCount = 0;
        let grandSumChargeAmount = 0;
        let territories = _.groupBy(
          JSON.parse(JSON.stringify(results)),
          function (d) {
            return d.territory;
          }
        );
        for (territory in territories) {
          output.push({
            territoryName: territory,
            sumTarget: territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumValidData: territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumDataReceivedPercent: Math.floor(
              (territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.target)
                  .map((x) => Number(x.target))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            ),
            sumLessContacted:
              territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0) -
              territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumlessContactPercentage:
              ((territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0) -
                territories[territory]
                  .filter((x) => x.dataRecived)
                  .map((x) => Number(x.dataRecived))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) /
                territories[territory]
                  .filter((x) => x.target)
                  .map((x) => Number(x.target))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
            sumConnectedCall: territories[territory]
              .filter((x) => x.connectedCall)
              .map((x) => Number(x.connectedCall))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumConnectedCallPercentage: Math.floor(
              (territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.dataRecived)
                  .map((x) => Number(x.dataRecived))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            ),
            sumTruelyConnected: territories[territory]
              .filter((x) => x.truelyConnected)
              .map((x) => Number(x.truelyConnected))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumTruelyConnectedPercentage: isNaN(
              Math.floor(
                (territories[territory]
                  .filter((x) => x.truelyConnected)
                  .map((x) => Number(x.truelyConnected))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                  100
              )
            )
              ? 0
              : Math.floor(
                  (territories[territory]
                    .filter((x) => x.truelyConnected)
                    .map((x) => Number(x.truelyConnected))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                    territories[territory]
                      .filter((x) => x.connectedCall)
                      .map((x) => Number(x.connectedCall))
                      .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                    100
                ),
            sumNotConnected: territories[territory]
              .filter((x) => x.notContacted)
              .map((x) => Number(x.notContacted))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNotContactedPercentage: isNaN(
              Math.floor(
                territories[territory]
                  .filter((x) => x.notContacted)
                  .map((x) => Number(x.notContacted))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)
              ) * 100
            )
              ? 0
              : Math.floor(
                  (territories[territory]
                    .filter((x) => x.notContacted)
                    .map((x) => Number(x.notContacted))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                    territories[territory]
                      .filter((x) => x.connectedCall)
                      .map((x) => Number(x.connectedCall))
                      .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                    100
                ),
            sumWtgNonSOB: territories[territory]
              .filter((x) => x.wtgNonSOB)
              .map((x) => Number(x.wtgNonSOB))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumWtgNonSOBPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.wtgNonSOB)
                .map((x) => Number(x.wtgNonSOB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.wtgNonSOB)
                  .map((x) => Number(x.wtgNonSOB))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumExtMSB: territories[territory]
              .filter((x) => x.extMSB)
              .map((x) => Number(x.extMSB))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtMSBPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.extMSB)
                .map((x) => Number(x.extMSB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.extMSB)
                  .map((x) => Number(x.extMSB))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumFalseContact: territories[territory]
              .filter((x) => x.falseContact)
              .map((x) => Number(x.falseContact))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumFalseContactPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.falseContact)
                .map((x) => Number(x.falseContact))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.falseContact)
                  .map((x) => Number(x.falseContact))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumNoFreeSample: territories[territory]
              .filter((x) => x.noFreeSample)
              .map((x) => Number(x.noFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumLessFreeSample: territories[territory]
              .filter((x) => x.lessFreeSample)
              .map((x) => Number(x.lessFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNoAndLessFreeSample: territories[territory]
              .filter((x) => x.noAndLessFreeSample)
              .map((x) => Number(x.noAndLessFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNoAndLessFreeSamplePercentage: isNaN(
              (territories[territory]
                .filter((x) => x.noAndLessFreeSample)
                .map((x) => Number(x.noAndLessFreeSample))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.noAndLessFreeSample)
                  .map((x) => Number(x.noAndLessFreeSample))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumTeaSnacks: territories[territory]
              .filter((x) => x.teaSnacks)
              .map((x) => Number(x.teaSnacks))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumTeaSnaksPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.teaSnacks)
                .map((x) => Number(x.teaSnacks))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.teaSnacks)
                  .map((x) => Number(x.teaSnacks))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumRetaination: territories[territory]
              .filter((x) => x.rentaintion)
              .map((x) => Number(x.rentaintion))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumRentaintionPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.rentaintion)
                .map((x) => Number(x.rentaintion))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.rentaintion)
                  .map((x) => Number(x.rentaintion))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumTargetTrueContact: territories[territory]
              .filter((x) => x.targetTrueContact)
              .map((x) => Number(x.targetTrueContact))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtrapulatedData: territories[territory]
              .filter((x) => x.extrapulatedData)
              .map((x) => Number(x.extrapulatedData))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtrapulatedPercentage: parseFloat(
              (
                ((territories[territory]
                  .filter((x) => x.truelyConnected)
                  .map((x) => Number(x.truelyConnected))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) *
                  territories[territory]
                    .filter((x) => x.dataRecived)
                    .map((x) => Number(x.dataRecived))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.target)
                    .map((x) => Number(x.target))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
              ).toFixed(2)
            ),
            sumLessMoreTrueContacted: territories[territory]
              .filter((x) => x.LessMoreTrueContacted)
              .map((x) => Number(x.LessMoreTrueContacted))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            avgConsumerAmount:
              territories[territory]
                .filter((x) => x.PerConsumerAverage)
                .map((x) => Number(x.PerConsumerAverage))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory].filter((x) => x.PerConsumerAverage).length,
            sumChargeAmount: territories[territory]
              .filter((x) => x.ChargeAmount)
              .map((x) => Number(x.ChargeAmount))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
          });
          grandSumTarget += territories[territory]
            .filter((x) => x.target)
            .map((x) => Number(x.target))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumValidData += territories[territory]
            .filter((x) => x.dataRecived)
            .map((x) => Number(x.dataRecived))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessContacted +=
            territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0) -
            territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumConnectedCall += territories[territory]
            .filter((x) => x.connectedCall)
            .map((x) => Number(x.connectedCall))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTruelyConnected += territories[territory]
            .filter((x) => x.truelyConnected)
            .map((x) => Number(x.truelyConnected))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNotConnected += territories[territory]
            .filter((x) => x.notContacted)
            .map((x) => Number(x.notContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumWtgNonSOB += territories[territory]
            .filter((x) => x.wtgNonSOB)
            .map((x) => Number(x.wtgNonSOB))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumExtMSB += territories[territory]
            .filter((x) => x.extMSB)
            .map((x) => Number(x.extMSB))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumFalseContact += territories[territory]
            .filter((x) => x.falseContact)
            .map((x) => Number(x.falseContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNoFreeSample += territories[territory]
            .filter((x) => x.noFreeSample)
            .map((x) => Number(x.noFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessFreeSample += territories[territory]
            .filter((x) => x.lessFreeSample)
            .map((x) => Number(x.lessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNoAndLessFreeSample += territories[territory]
            .filter((x) => x.noAndLessFreeSample)
            .map((x) => Number(x.noAndLessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTeaSnacks += territories[territory]
            .filter((x) => x.teaSnacks)
            .map((x) => Number(x.teaSnacks))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumRetaination += territories[territory]
            .filter((x) => x.rentaintion)
            .map((x) => Number(x.rentaintion))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTargetTrueContact += territories[territory]
            .filter((x) => x.targetTrueContact)
            .map((x) => Number(x.targetTrueContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumExtrapulatedData += territories[territory]
            .filter((x) => x.extrapulatedData)
            .map((x) => Number(x.extrapulatedData))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessMoreTrueContacted += territories[territory]
            .filter((x) => x.LessMoreTrueContacted)
            .map((x) => Number(x.LessMoreTrueContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandAvgConsumerAmount +=
            territories[territory]
              .filter((x) => x.PerConsumerAverage)
              .map((x) => Number(x.PerConsumerAverage))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
            territories[territory].filter((x) => x.PerConsumerAverage).length;
          // grandAvgConsumerCount +=
          //   territories[territory]
          //     .filter((x) => x.PerConsumerAverage)
          //     .map((x) => Number(x.PerConsumerAverage))
          //     .reduce((sum, cv) => (sum += Number(cv)), 0) /
          //   territories[territory].filter((x) => x.PerConsumerAverage).length;
          grandSumChargeAmount += territories[territory]
            .filter((x) => x.ChargeAmount)
            .map((x) => Number(x.ChargeAmount))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
        }
        output = output.map((r) => {
          return {
            ...r,
            grandSumTarget,
            grandSumValidData,
            grandSumLessContacted,
            grandSumConnectedCall,
            grandSumTruelyConnected,
            grandSumNotConnected,
            grandSumWtgNonSOB,
            grandSumExtMSB,
            grandSumFalseContact,
            grandSumNoFreeSample,
            grandSumLessFreeSample,
            grandSumNoAndLessFreeSample,
            grandSumTeaSnacks,
            grandSumRetaination,
            grandSumTargetTrueContact,
            grandSumExtrapulatedData,
            grandSumLessMoreTrueContacted,
            grandAvgConsumerAmount,
            grandSumChargeAmount,
            grandAvgConsumerCount,
          };
        });
        res.send(output);
      });
  });

  app.get("/territoryPlusReport", (req, res) => {
    const regenDate = req.query.regenDate;
    console.log(regenDate);
    reportDatasCollection
      .aggregate([
        {
          $match: {
            $and: [{ ChargeAmount: { $gte: 0 } }],
          },
        },
      ])
      .toArray((err, results) => {
        let output = [];
        let grandSumTarget = 0;
        let grandSumValidData = 0;
        let grandSumLessContacted = 0;
        let grandSumConnectedCall = 0;
        let grandSumTruelyConnected = 0;
        let grandSumNotConnected = 0;
        let grandSumWtgNonSOB = 0;
        let grandSumExtMSB = 0;
        let grandSumFalseContact = 0;
        let grandSumNoFreeSample = 0;
        let grandSumLessFreeSample = 0;
        let grandSumNoAndLessFreeSample = 0;
        let grandSumTeaSnacks = 0;
        let grandSumRetaination = 0;
        let grandSumTargetTrueContact = 0;
        let grandSumExtrapulatedData = 0;
        let grandSumLessMoreTrueContacted = 0;
        let grandAvgConsumerAmount = 0;
        let grandAvgConsumerCount = 0;
        let grandSumChargeAmount = 0;
        let territories = _.groupBy(
          JSON.parse(JSON.stringify(results)),
          function (d) {
            return d.territory;
          }
        );
        for (territory in territories) {
          output.push({
            territoryName: territory,
            sumTarget: territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumValidData: territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumDataReceivedPercent: Math.floor(
              (territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.target)
                  .map((x) => Number(x.target))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            ),
            sumLessContacted:
              territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0) -
              territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumlessContactPercentage:
              ((territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0) -
                territories[territory]
                  .filter((x) => x.dataRecived)
                  .map((x) => Number(x.dataRecived))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) /
                territories[territory]
                  .filter((x) => x.target)
                  .map((x) => Number(x.target))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
            sumConnectedCall: territories[territory]
              .filter((x) => x.connectedCall)
              .map((x) => Number(x.connectedCall))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumConnectedCallPercentage: Math.floor(
              (territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.dataRecived)
                  .map((x) => Number(x.dataRecived))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            ),
            sumTruelyConnected: territories[territory]
              .filter((x) => x.truelyConnected)
              .map((x) => Number(x.truelyConnected))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumTruelyConnectedPercentage: isNaN(
              Math.floor(
                (territories[territory]
                  .filter((x) => x.truelyConnected)
                  .map((x) => Number(x.truelyConnected))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                  100
              )
            )
              ? 0
              : Math.floor(
                  (territories[territory]
                    .filter((x) => x.truelyConnected)
                    .map((x) => Number(x.truelyConnected))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                    territories[territory]
                      .filter((x) => x.connectedCall)
                      .map((x) => Number(x.connectedCall))
                      .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                    100
                ),
            sumNotConnected: territories[territory]
              .filter((x) => x.notContacted)
              .map((x) => Number(x.notContacted))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNotContactedPercentage: isNaN(
              Math.floor(
                territories[territory]
                  .filter((x) => x.notContacted)
                  .map((x) => Number(x.notContacted))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)
              ) * 100
            )
              ? 0
              : Math.floor(
                  (territories[territory]
                    .filter((x) => x.notContacted)
                    .map((x) => Number(x.notContacted))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                    territories[territory]
                      .filter((x) => x.connectedCall)
                      .map((x) => Number(x.connectedCall))
                      .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                    100
                ),
            sumWtgNonSOB: territories[territory]
              .filter((x) => x.wtgNonSOB)
              .map((x) => Number(x.wtgNonSOB))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumWtgNonSOBPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.wtgNonSOB)
                .map((x) => Number(x.wtgNonSOB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.wtgNonSOB)
                  .map((x) => Number(x.wtgNonSOB))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumExtMSB: territories[territory]
              .filter((x) => x.extMSB)
              .map((x) => Number(x.extMSB))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtMSBPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.extMSB)
                .map((x) => Number(x.extMSB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.extMSB)
                  .map((x) => Number(x.extMSB))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumFalseContact: territories[territory]
              .filter((x) => x.falseContact)
              .map((x) => Number(x.falseContact))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumFalseContactPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.falseContact)
                .map((x) => Number(x.falseContact))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.falseContact)
                  .map((x) => Number(x.falseContact))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumNoFreeSample: territories[territory]
              .filter((x) => x.noFreeSample)
              .map((x) => Number(x.noFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumLessFreeSample: territories[territory]
              .filter((x) => x.lessFreeSample)
              .map((x) => Number(x.lessFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNoAndLessFreeSample: territories[territory]
              .filter((x) => x.noAndLessFreeSample)
              .map((x) => Number(x.noAndLessFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumNoAndLessFreeSamplePercentage: isNaN(
              (territories[territory]
                .filter((x) => x.noAndLessFreeSample)
                .map((x) => Number(x.noAndLessFreeSample))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.noAndLessFreeSample)
                  .map((x) => Number(x.noAndLessFreeSample))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumTeaSnacks: territories[territory]
              .filter((x) => x.teaSnacks)
              .map((x) => Number(x.teaSnacks))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumTeaSnaksPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.teaSnacks)
                .map((x) => Number(x.teaSnacks))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.teaSnacks)
                  .map((x) => Number(x.teaSnacks))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumRetaination: territories[territory]
              .filter((x) => x.rentaintion)
              .map((x) => Number(x.rentaintion))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumRentaintionPercentage: isNaN(
              (territories[territory]
                .filter((x) => x.rentaintion)
                .map((x) => Number(x.rentaintion))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
              ? 0
              : (territories[territory]
                  .filter((x) => x.rentaintion)
                  .map((x) => Number(x.rentaintion))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100,
            sumTargetTrueContact: territories[territory]
              .filter((x) => x.targetTrueContact)
              .map((x) => Number(x.targetTrueContact))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtrapulatedData: territories[territory]
              .filter((x) => x.extrapulatedData)
              .map((x) => Number(x.extrapulatedData))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            sumExtrapulatedPercentage: parseFloat(
              (
                ((territories[territory]
                  .filter((x) => x.truelyConnected)
                  .map((x) => Number(x.truelyConnected))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) *
                  territories[territory]
                    .filter((x) => x.dataRecived)
                    .map((x) => Number(x.dataRecived))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.target)
                    .map((x) => Number(x.target))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
              ).toFixed(2)
            ),
            sumLessMoreTrueContacted: territories[territory]
              .filter((x) => x.LessMoreTrueContacted)
              .map((x) => Number(x.LessMoreTrueContacted))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
            avgConsumerAmount:
              territories[territory]
                .filter((x) => x.PerConsumerAverage)
                .map((x) => Number(x.PerConsumerAverage))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory].filter((x) => x.PerConsumerAverage).length,
            sumChargeAmount: territories[territory]
              .filter((x) => x.ChargeAmount)
              .map((x) => Number(x.ChargeAmount))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
          });
          grandSumTarget += territories[territory]
            .filter((x) => x.target)
            .map((x) => Number(x.target))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumValidData += territories[territory]
            .filter((x) => x.dataRecived)
            .map((x) => Number(x.dataRecived))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessContacted +=
            territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0) -
            territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumConnectedCall += territories[territory]
            .filter((x) => x.connectedCall)
            .map((x) => Number(x.connectedCall))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTruelyConnected += territories[territory]
            .filter((x) => x.truelyConnected)
            .map((x) => Number(x.truelyConnected))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNotConnected += territories[territory]
            .filter((x) => x.notContacted)
            .map((x) => Number(x.notContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumWtgNonSOB += territories[territory]
            .filter((x) => x.wtgNonSOB)
            .map((x) => Number(x.wtgNonSOB))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumExtMSB += territories[territory]
            .filter((x) => x.extMSB)
            .map((x) => Number(x.extMSB))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumFalseContact += territories[territory]
            .filter((x) => x.falseContact)
            .map((x) => Number(x.falseContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNoFreeSample += territories[territory]
            .filter((x) => x.noFreeSample)
            .map((x) => Number(x.noFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessFreeSample += territories[territory]
            .filter((x) => x.lessFreeSample)
            .map((x) => Number(x.lessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumNoAndLessFreeSample += territories[territory]
            .filter((x) => x.noAndLessFreeSample)
            .map((x) => Number(x.noAndLessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTeaSnacks += territories[territory]
            .filter((x) => x.teaSnacks)
            .map((x) => Number(x.teaSnacks))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumRetaination += territories[territory]
            .filter((x) => x.rentaintion)
            .map((x) => Number(x.rentaintion))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumTargetTrueContact += territories[territory]
            .filter((x) => x.targetTrueContact)
            .map((x) => Number(x.targetTrueContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumExtrapulatedData += territories[territory]
            .filter((x) => x.extrapulatedData)
            .map((x) => Number(x.extrapulatedData))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandSumLessMoreTrueContacted += territories[territory]
            .filter((x) => x.LessMoreTrueContacted)
            .map((x) => Number(x.LessMoreTrueContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
          grandAvgConsumerAmount +=
            territories[territory]
              .filter((x) => x.PerConsumerAverage)
              .map((x) => Number(x.PerConsumerAverage))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
            territories[territory].filter((x) => x.PerConsumerAverage).length;
          // grandAvgConsumerCount +=
          //   territories[territory]
          //     .filter((x) => x.PerConsumerAverage)
          //     .map((x) => Number(x.PerConsumerAverage))
          //     .reduce((sum, cv) => (sum += Number(cv)), 0) /
          //   territories[territory].filter((x) => x.PerConsumerAverage).length;
          grandSumChargeAmount += territories[territory]
            .filter((x) => x.ChargeAmount)
            .map((x) => Number(x.ChargeAmount))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
        }
        output = output.map((r) => {
          return {
            ...r,
            grandSumTarget,
            grandSumValidData,
            grandSumLessContacted,
            grandSumConnectedCall,
            grandSumTruelyConnected,
            grandSumNotConnected,
            grandSumWtgNonSOB,
            grandSumExtMSB,
            grandSumFalseContact,
            grandSumNoFreeSample,
            grandSumLessFreeSample,
            grandSumNoAndLessFreeSample,
            grandSumTeaSnacks,
            grandSumRetaination,
            grandSumTargetTrueContact,
            grandSumExtrapulatedData,
            grandSumLessMoreTrueContacted,
            grandAvgConsumerAmount,
            grandSumChargeAmount,
            grandAvgConsumerCount,
          };
        });
        res.send(output);
      });
  });

  app.get("/territoryCombineReport", (req, res) => {
    const regenDate = req.query.regenDate;
    console.log(regenDate);
    reportDatasCollection.find({}).toArray((err, results) => {
      let output = [];
      let grandSumTarget = 0;
      let grandSumValidData = 0;
      let grandSumLessContacted = 0;
      let grandSumConnectedCall = 0;
      let grandSumTruelyConnected = 0;
      let grandSumNotConnected = 0;
      let grandSumWtgNonSOB = 0;
      let grandSumExtMSB = 0;
      let grandSumFalseContact = 0;
      let grandSumNoFreeSample = 0;
      let grandSumLessFreeSample = 0;
      let grandSumNoAndLessFreeSample = 0;
      let grandSumTeaSnacks = 0;
      let grandSumRetaination = 0;
      let grandSumTargetTrueContact = 0;
      let grandSumExtrapulatedData = 0;
      let grandSumLessMoreTrueContacted = 0;
      let grandAvgConsumerAmount = 0;
      let grandAvgConsumerCount = 0;
      let grandSumChargeAmount = 0;
      let territories = _.groupBy(
        JSON.parse(JSON.stringify(results)),
        function (d) {
          return d.territory;
        }
      );
      for (territory in territories) {
        output.push({
          territoryName: territory,
          dataDate: territories[territory][0].dataDate,
          callDate: territories[territory][0].callDate,
          sumTarget: territories[territory]
            .filter((x) => x.target)
            .map((x) => Number(x.target))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumValidData: territories[territory]
            .filter((x) => x.dataRecived)
            .map((x) => Number(x.dataRecived))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumDataReceivedPercent: Math.floor(
            (territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          ),
          sumLessContacted:
            territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0) -
            territories[territory]
              .filter((x) => x.dataRecived)
              .map((x) => Number(x.dataRecived))
              .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumlessContactPercentage:
            ((territories[territory]
              .filter((x) => x.target)
              .map((x) => Number(x.target))
              .reduce((sum, cv) => (sum += Number(cv)), 0) -
              territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) /
              territories[territory]
                .filter((x) => x.target)
                .map((x) => Number(x.target))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
            100,
          sumConnectedCall: territories[territory]
            .filter((x) => x.connectedCall)
            .map((x) => Number(x.connectedCall))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumConnectedCallPercentage: Math.floor(
            (territories[territory]
              .filter((x) => x.connectedCall)
              .map((x) => Number(x.connectedCall))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.dataRecived)
                .map((x) => Number(x.dataRecived))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          ),
          sumTruelyConnected: territories[territory]
            .filter((x) => x.truelyConnected)
            .map((x) => Number(x.truelyConnected))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumTruelyConnectedPercentage: isNaN(
            Math.floor(
              (territories[territory]
                .filter((x) => x.truelyConnected)
                .map((x) => Number(x.truelyConnected))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                100
            )
          )
            ? 0
            : Math.floor(
                (territories[territory]
                  .filter((x) => x.truelyConnected)
                  .map((x) => Number(x.truelyConnected))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                  100
              ),
          sumNotConnected: territories[territory]
            .filter((x) => x.notContacted)
            .map((x) => Number(x.notContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumNotContactedPercentage: isNaN(
            Math.floor(
              territories[territory]
                .filter((x) => x.notContacted)
                .map((x) => Number(x.notContacted))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)
            ) * 100
          )
            ? 0
            : Math.floor(
                (territories[territory]
                  .filter((x) => x.notContacted)
                  .map((x) => Number(x.notContacted))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                  territories[territory]
                    .filter((x) => x.connectedCall)
                    .map((x) => Number(x.connectedCall))
                    .reduce((sum, cv) => (sum += Number(cv)), 0)) *
                  100
              ),
          sumWtgNonSOB: territories[territory]
            .filter((x) => x.wtgNonSOB)
            .map((x) => Number(x.wtgNonSOB))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumWtgNonSOBPercentage: isNaN(
            (territories[territory]
              .filter((x) => x.wtgNonSOB)
              .map((x) => Number(x.wtgNonSOB))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.wtgNonSOB)
                .map((x) => Number(x.wtgNonSOB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumExtMSB: territories[territory]
            .filter((x) => x.extMSB)
            .map((x) => Number(x.extMSB))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumExtMSBPercentage: isNaN(
            (territories[territory]
              .filter((x) => x.extMSB)
              .map((x) => Number(x.extMSB))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.extMSB)
                .map((x) => Number(x.extMSB))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumFalseContact: territories[territory]
            .filter((x) => x.falseContact)
            .map((x) => Number(x.falseContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumFalseContactPercentage: isNaN(
            (territories[territory]
              .filter((x) => x.falseContact)
              .map((x) => Number(x.falseContact))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.falseContact)
                .map((x) => Number(x.falseContact))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumNoFreeSample: territories[territory]
            .filter((x) => x.noFreeSample)
            .map((x) => Number(x.noFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumLessFreeSample: territories[territory]
            .filter((x) => x.lessFreeSample)
            .map((x) => Number(x.lessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumNoAndLessFreeSample: territories[territory]
            .filter((x) => x.noAndLessFreeSample)
            .map((x) => Number(x.noAndLessFreeSample))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumNoAndLessFreeSamplePercentage: isNaN(
            (territories[territory]
              .filter((x) => x.noAndLessFreeSample)
              .map((x) => Number(x.noAndLessFreeSample))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.noAndLessFreeSample)
                .map((x) => Number(x.noAndLessFreeSample))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumTeaSnacks: territories[territory]
            .filter((x) => x.teaSnacks)
            .map((x) => Number(x.teaSnacks))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumTeaSnaksPercentage: isNaN(
            (territories[territory]
              .filter((x) => x.teaSnacks)
              .map((x) => Number(x.teaSnacks))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.teaSnacks)
                .map((x) => Number(x.teaSnacks))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumRetaination: territories[territory]
            .filter((x) => x.rentaintion)
            .map((x) => Number(x.rentaintion))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumRentaintionPercentage: isNaN(
            (territories[territory]
              .filter((x) => x.rentaintion)
              .map((x) => Number(x.rentaintion))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
              territories[territory]
                .filter((x) => x.connectedCall)
                .map((x) => Number(x.connectedCall))
                .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
          )
            ? 0
            : (territories[territory]
                .filter((x) => x.rentaintion)
                .map((x) => Number(x.rentaintion))
                .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100,
          sumTargetTrueContact: territories[territory]
            .filter((x) => x.targetTrueContact)
            .map((x) => Number(x.targetTrueContact))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumExtrapulatedData: territories[territory]
            .filter((x) => x.extrapulatedData)
            .map((x) => Number(x.extrapulatedData))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          sumExtrapulatedPercentage: parseFloat(
            (
              ((territories[territory]
                .filter((x) => x.truelyConnected)
                .map((x) => Number(x.truelyConnected))
                .reduce((sum, cv) => (sum += Number(cv)), 0) *
                territories[territory]
                  .filter((x) => x.dataRecived)
                  .map((x) => Number(x.dataRecived))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) /
                territories[territory]
                  .filter((x) => x.connectedCall)
                  .map((x) => Number(x.connectedCall))
                  .reduce((sum, cv) => (sum += Number(cv)), 0) /
                territories[territory]
                  .filter((x) => x.target)
                  .map((x) => Number(x.target))
                  .reduce((sum, cv) => (sum += Number(cv)), 0)) *
              100
            ).toFixed(2)
          ),
          sumLessMoreTrueContacted: territories[territory]
            .filter((x) => x.LessMoreTrueContacted)
            .map((x) => Number(x.LessMoreTrueContacted))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
          avgConsumerAmount:
            territories[territory]
              .filter((x) => x.PerConsumerAverage)
              .map((x) => Number(x.PerConsumerAverage))
              .reduce((sum, cv) => (sum += Number(cv)), 0) /
            territories[territory].filter((x) => x.PerConsumerAverage).length,
          sumChargeAmount: territories[territory]
            .filter((x) => x.ChargeAmount)
            .map((x) => Number(x.ChargeAmount))
            .reduce((sum, cv) => (sum += Number(cv)), 0),
        });
        grandSumTarget += territories[territory]
          .filter((x) => x.target)
          .map((x) => Number(x.target))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumValidData += territories[territory]
          .filter((x) => x.dataRecived)
          .map((x) => Number(x.dataRecived))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumLessContacted +=
          territories[territory]
            .filter((x) => x.target)
            .map((x) => Number(x.target))
            .reduce((sum, cv) => (sum += Number(cv)), 0) -
          territories[territory]
            .filter((x) => x.dataRecived)
            .map((x) => Number(x.dataRecived))
            .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumConnectedCall += territories[territory]
          .filter((x) => x.connectedCall)
          .map((x) => Number(x.connectedCall))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumTruelyConnected += territories[territory]
          .filter((x) => x.truelyConnected)
          .map((x) => Number(x.truelyConnected))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumNotConnected += territories[territory]
          .filter((x) => x.notContacted)
          .map((x) => Number(x.notContacted))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumWtgNonSOB += territories[territory]
          .filter((x) => x.wtgNonSOB)
          .map((x) => Number(x.wtgNonSOB))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumExtMSB += territories[territory]
          .filter((x) => x.extMSB)
          .map((x) => Number(x.extMSB))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumFalseContact += territories[territory]
          .filter((x) => x.falseContact)
          .map((x) => Number(x.falseContact))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumNoFreeSample += territories[territory]
          .filter((x) => x.noFreeSample)
          .map((x) => Number(x.noFreeSample))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumLessFreeSample += territories[territory]
          .filter((x) => x.lessFreeSample)
          .map((x) => Number(x.lessFreeSample))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumNoAndLessFreeSample += territories[territory]
          .filter((x) => x.noAndLessFreeSample)
          .map((x) => Number(x.noAndLessFreeSample))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumTeaSnacks += territories[territory]
          .filter((x) => x.teaSnacks)
          .map((x) => Number(x.teaSnacks))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumRetaination += territories[territory]
          .filter((x) => x.rentaintion)
          .map((x) => Number(x.rentaintion))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumTargetTrueContact += territories[territory]
          .filter((x) => x.targetTrueContact)
          .map((x) => Number(x.targetTrueContact))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumExtrapulatedData += territories[territory]
          .filter((x) => x.extrapulatedData)
          .map((x) => Number(x.extrapulatedData))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandSumLessMoreTrueContacted += territories[territory]
          .filter((x) => x.LessMoreTrueContacted)
          .map((x) => Number(x.LessMoreTrueContacted))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
        grandAvgConsumerAmount +=
          territories[territory]
            .filter((x) => x.PerConsumerAverage)
            .map((x) => Number(x.PerConsumerAverage))
            .reduce((sum, cv) => (sum += Number(cv)), 0) /
          territories[territory].filter((x) => x.PerConsumerAverage).length;
        // grandAvgConsumerCount +=
        //   territories[territory]
        //     .filter((x) => x.PerConsumerAverage)
        //     .map((x) => Number(x.PerConsumerAverage))
        //     .reduce((sum, cv) => (sum += Number(cv)), 0) /
        //   territories[territory].filter((x) => x.PerConsumerAverage).length;
        grandSumChargeAmount += territories[territory]
          .filter((x) => x.ChargeAmount)
          .map((x) => Number(x.ChargeAmount))
          .reduce((sum, cv) => (sum += Number(cv)), 0);
      }
      output = output.map((r) => {
        return {
          ...r,
          grandSumTarget,
          grandSumValidData,
          grandSumLessContacted,
          grandSumConnectedCall,
          grandSumTruelyConnected,
          grandSumNotConnected,
          grandSumWtgNonSOB,
          grandSumExtMSB,
          grandSumFalseContact,
          grandSumNoFreeSample,
          grandSumLessFreeSample,
          grandSumNoAndLessFreeSample,
          grandSumTeaSnacks,
          grandSumRetaination,
          grandSumTargetTrueContact,
          grandSumExtrapulatedData,
          grandSumLessMoreTrueContacted,
          grandAvgConsumerAmount,
          grandSumChargeAmount,
          grandAvgConsumerCount,
        };
      });
      res.send(output);
    });
  });

  app.get("/splitReport", (req, res) => {
    let initDate = req.query.initDate;
    reportDatasCollection.find({}).toArray((err, results) => {
      let output = [];
      let territories = _.groupBy(
        JSON.parse(JSON.stringify(results)),
        function (d) {
          return d.territory;
        }
      );
      for (territory in territories) {
        output.push({
          userId: territory,
          consumers: territories[territory],
          // countByUser: users[user].length,
          // initLeads: users[user]
          //   .slice(0, Math.round((users[user].length * 25) / 100))
          //   .map((d) => {
          //     let datas = {};
          //     (datas.id = d._id),
          //       (datas.diid = d.DIID),
          //       (datas.data_date = d.data_date),
          //       (datas.r_name = d.r_name),
          //       (datas.Consumer_No = d.Consumer_No);
          //     return datas;
          //   }),
        });
      }
      res.send(output);
    });
  });

  app.get("/reportTable", (req, res) => {
    tmsTmrCollection.find({}).toArray((err, reportTable) => {
      res.send(reportTable);
    });
  });
  app.get("/rangeTmrTms", (req, res) => {
    const startID = 0;
    const endID = 0;
    tmsTmrCollection.aggregate([
      {
        $match: {
          $and: [{ territoryID: { $lte: 0 } }, { territoryID: { $gte: 0 } }],
        },
      },
    ]);
  });
  app.get("/territoryReports", (req, res) => {
    territoryReportCollection.find({}).toArray((err, territoryReports) => {
      res.send(territoryReports);
    });
  });
  //Delete All Database
  app.delete("/deleteOldData", (req, res) => {
    finalReport.deleteMany({}).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
  app.delete("/deleteTmr", (req, res) => {
    questionResult.deleteMany({}).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
  app.delete("/deleteTerritory", (req, res) => {
    territoryReport.deleteMany({}).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
  //Connected Call Updated to Database
  app.patch("/update1", async (req, res) => {
    const condition1 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      condition1.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                connectedCall: element.connectedCall,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  // Update True Contact
  app.patch("/updateTrueContact", async (req, res) => {
    const trueContact = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      trueContact.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                trueContact: element.trueContact,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update non SOB1
  app.patch("/updatenonSOB1", async (req, res) => {
    const nonSOB1 = req.body;
    console.log(nonSOB1);
    let buldOperation = [];
    let counter = 0;

    try {
      nonSOB1.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                nonSOB1: element.nonSOB1,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Non SOB2
  app.patch("/updatenonSOB2", async (req, res) => {
    const nonSOB2 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      nonSOB2.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                nonSOB2_Final: element.nonSOB2_Final,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update EXT MSB
  app.patch("/updateextMSB", async (req, res) => {
    const extMSB = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      extMSB.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                extMSB: element.extMSB,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Not Contacted 1
  app.patch("/updateNotContacted1", async (req, res) => {
    const notContacted1 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      notContacted1.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContacteda: element.notContacteda,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Not Contacted 2
  app.patch("/updateNotContacted2", async (req, res) => {
    const notContacted2 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      notContacted2.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContactedb: element.notContactedb,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Not Contacted 3
  app.patch("/updateNotContacted3", async (req, res) => {
    const notContacted3 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      notContacted3.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContactedc: element.notContactedc,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Not Contacted 4
  app.patch("/updateNotContacted4", async (req, res) => {
    const notContacted4 = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      notContacted4.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContactedd: element.notContactedd,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Final Not Contacted
  app.patch("/updateFinalNotContacted", async (req, res) => {
    const finalNotContacted = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      finalNotContacted.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContacted: element.notContacted,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Pure Not Contacted
  app.patch("/updateFinalPureNotContacted", async (req, res) => {
    const finalPureNotContacted = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      finalPureNotContacted.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                notContacted: element.notContacted,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update False Contact
  app.patch("/updateFalseContact", async (req, res) => {
    const falseContact = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      falseContact.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                falseContactFinal: element.falseContactFinal,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Verified True Contact
  app.patch("/updateVerifiedTrueContact", async (req, res) => {
    const verifyTrueContact = req.body;
    console.log(verifyTrueContact);
    let buldOperation = [];
    let counter = 0;

    try {
      verifyTrueContact.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                trueContact: element.trueContact,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update No free Sample
  app.patch("/updateNoFreeSample", async (req, res) => {
    const noFreeSample = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      noFreeSample.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                noFreeSample: element.noFreeSample,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Less free Sample
  app.patch("/updateLessFreeSample", async (req, res) => {
    const lessFreeSample = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      lessFreeSample.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                lessFreeSample: element.lessFreeSample,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Tea Snaks
  app.patch("/updateTeaSnaks", async (req, res) => {
    const teaSnaks = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      teaSnaks.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                teaSnaks: element.teaSnaks,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
  //Update Rention
  app.patch("/updateRetention", async (req, res) => {
    const retention = req.body;
    let buldOperation = [];
    let counter = 0;

    try {
      retention.forEach(async (element) => {
        buldOperation.push({
          updateOne: {
            filter: { _id: ObjectID(element._id) },
            update: {
              $set: {
                retention: element.retention,
              },
            },
          },
        });
        counter++;

        if (counter % 500 == 0) {
          await leadsCollection.bulkWrite(buldOperation);
          buldOperation = [];
        }
      });
      if (counter % 500 != 0) {
        await leadsCollection.bulkWrite(buldOperation);
        buldOperation = [];
      }
      console.log("DONE ================== ");

      res.status(200).json({
        message: true,
      });
    } catch (error) {
      console.log(error);
    }
  });

  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../eas_client/build", "index.html"));
  // });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
