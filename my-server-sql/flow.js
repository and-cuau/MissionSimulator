// const { FlowProducer } = require("bullmq");
// const connection = require("./redis");

// const flow = new FlowProducer({ connection });

// flow.add({
//   name: "mission-001",
//   queueName: "missions",
//   data: { missionTitle: "Alpha Sweep" },
//   children: [
//     {
//       name: "objective-001",
//       queueName: "objectives",
//       data: { description: "Secure LZ" },
//     },
//     {
//       name: "objective-002",
//       queueName: "objectives",
//       data: { description: "Establish Perimeter" },
//     },
//   ],
// });
