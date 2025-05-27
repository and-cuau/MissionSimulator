const { FlowProducer } = require("bullmq");

const IORedis = require('ioredis');

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const flow = new FlowProducer({ connection });

function nestify( array, index = 0){
     if (index >= array.length) {
        return null; 
    }

    const current = { ...array[index] }; 
    const nested = nestify(array, index + 1);
    current.children = nested ? [nested] : undefined;

    return current;
}


module.exports = (missionId, missionObjectives) => {

let objectiveJobs = [];


missionObjectives.forEach(el => {
     const {
        description,
        status,
        depends_on,
        estimated_duration,
        start_time,
        end_time,
      } = el;
    const newObj = {name: description, queueName: "objectives", data:{ description: description, Length: estimated_duration}, opts: {attempts: 1}, children: null};
    objectiveJobs.push(newObj); // parseInt("42", 10);
});

    // console.log(objectiveJobs);

    let nestified_array = objectiveJobs[0];

    objectiveJobs = objectiveJobs.reverse();
    objectiveJobs = nestify(objectiveJobs);


    console.log();
    console.log("test:");
    console.dir(objectiveJobs, { depth: null });

//    myQueue.add(
//     "some_mission_title",
//     { jobId: mission_id, MissionId: mission_id, Length: length },
//     { delay: delay_ms, attempts: 1 },
//   );

flow.add({
  name: missionId, // was "mission-001"
  queueName: "missions",
  data: {jobId: missionId, mission_id: missionId, Length: 4500},
  opts: {attempts: 1},
  children: [objectiveJobs],
});
}


// flow.add({
//   name: "mission-001",
//   queueName: "missions",
//   data: { missionTitle: "Kill John Wick"},
//   children: [
//     {
//       name: "objective-001",
//       queueName: "objectives",
//       data: { description: "Burn pizza in microwave oven" },
//     },
//     {
//       name: "objective-002",
//       queueName: "objectives",
//       data: { description: "Sharpen pencil" },
//     },
//   ],
// });

