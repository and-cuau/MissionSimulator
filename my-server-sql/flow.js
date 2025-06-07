const { FlowProducer } = require("bullmq");

const IORedis = require("ioredis");




if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});




const flow = new FlowProducer({ connection });

function nestify(array, index = 0) {
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
  let objectiveid = 1;

  console.log(missionObjectives);

  missionObjectives.forEach((el) => {
    const {
      id,
      mission_id,
      description,
      status,
      depends_on,
      est_duration,
      start_time,
      end_time,
    } = el;

    console.log("est duration" + est_duration);

    combinedid = missionId + "-" + objectiveid;

    const newObj = {
      name: description,
      queueName: "objectives",

      data: {
        jobId: objectiveid,
        description: description,
        Length: est_duration,
      },
      opts: {
        jobId: combinedid,
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
      },
      children: null,
    };
    objectiveJobs.push(newObj); // parseInt("42", 10);
    objectiveid++;
  });

  // console.log(objectiveJobs);

  //let nestified_array = objectiveJobs[0];

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
    data: { jobId: missionId, mission_id: missionId, Length: 4500 },
    opts: { attempts: 1 },
    children: [objectiveJobs],
  });
};

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
