/**
 * Automated Verification Script for Task Rollover & Carry-Forward Engine
 */
const { shouldTaskRollForward } = require('../src/core/rollover.js');
const { getOperationalDate, isTaskScheduledForDate } = require('../src/core/recurrence.js');

let passed = 0;
let total = 0;

function assert(desc, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    process.exit(1);
  }
}

console.log('Testing Task Rollover Engine...');

// 1. Custom Interval 7 days (Created Nov 1)
const customTask = {
  id: 'task_custom_7',
  userId: 'usr_1',
  title: 'Weekly Review',
  flavor: 'checklist',
  frequency: 'custom',
  intervalDays: 7,
  createdAt: '2026-11-01T10:00:00Z',
  lifecycleStatus: 'active',
};

// Day 1: Scheduled directly
const opNov1 = getOperationalDate(new Date('2026-11-01T10:00:00Z'));
assert('Custom interval 7 is scheduled on Day 1 by cadence', isTaskScheduledForDate(customTask, opNov1));

// Day 2 (Nov 2) - No events -> should roll forward
const opNov2 = getOperationalDate(new Date('2026-11-02T10:00:00Z'));
assert('Custom interval 7 rolls forward to Day 2 when uncompleted', shouldTaskRollForward(customTask, opNov2, []));

// If ignored on Day 1 -> should NOT roll forward to Day 2
const eventNov1Ignored = [{
  id: 'evt_0',
  userId: 'usr_1',
  taskId: 'task_custom_7',
  status: 'ignored',
  targetDate: '2026-11-01',
  occurredAt: '2026-11-01T12:00:00Z',
}];
assert('Custom interval 7 does NOT roll forward to Day 2 if rested on Day 1', !shouldTaskRollForward(customTask, opNov2, eventNov1Ignored));

// Day 2 completed -> Day 3 should NOT roll forward
const opNov3 = getOperationalDate(new Date('2026-11-03T10:00:00Z'));
const eventNov2Complete = [{
  id: 'evt_1',
  userId: 'usr_1',
  taskId: 'task_custom_7',
  status: 'completed',
  targetDate: '2026-11-02',
  occurredAt: '2026-11-02T12:00:00Z',
}];
assert('Custom interval 7 does NOT roll forward to Day 3 if completed on Day 2', !shouldTaskRollForward(customTask, opNov3, eventNov2Complete));

// Day 2 ignored -> Day 3 should NOT roll forward
const eventNov2Ignored = [{
  id: 'evt_2',
  userId: 'usr_1',
  taskId: 'task_custom_7',
  status: 'ignored',
  targetDate: '2026-11-02',
  occurredAt: '2026-11-02T12:00:00Z',
}];
assert('Custom interval 7 does NOT roll forward to Day 3 if ignored/rested on Day 2', !shouldTaskRollForward(customTask, opNov3, eventNov2Ignored));

// Day 8 (Nov 8): Scheduled by regular cadence regardless of Day 2 completion!
const opNov8 = getOperationalDate(new Date('2026-11-08T10:00:00Z'));
assert('Day 8 retains its fixed interval anchor regardless of Day 2 completion', isTaskScheduledForDate(customTask, opNov8));

// 2. Specific Days [1, 4] (Mon & Thu)
// 2026-11-09 is Monday (1). 2026-11-10 is Tuesday (2).
const daysTask = {
  id: 'task_days',
  userId: 'usr_1',
  title: 'Gym Session',
  flavor: 'checklist',
  frequency: 'days_of_week',
  daysOfWeek: [1, 4],
  createdAt: '2026-11-01T10:00:00Z',
  lifecycleStatus: 'active',
};

const opTueNov10 = getOperationalDate(new Date('2026-11-10T10:00:00Z')); // Tuesday
assert('Days of week [1, 4] rolls forward from Mon to Tue when uncompleted', shouldTaskRollForward(daysTask, opTueNov10, []));

// Completed on Tue -> Wed (Nov 11) should NOT roll forward
const opWedNov11 = getOperationalDate(new Date('2026-11-11T10:00:00Z'));
const eventTueComplete = [{
  id: 'evt_3',
  userId: 'usr_1',
  taskId: 'task_days',
  status: 'completed',
  targetDate: '2026-11-10',
  occurredAt: '2026-11-10T15:00:00Z',
}];
assert('Days of week [1, 4] does NOT roll forward to Wed if completed on Tue', !shouldTaskRollForward(daysTask, opWedNov11, eventTueComplete));

// Thu (Nov 12 is Thu 4): Scheduled by regular cadence
const opThuNov12 = getOperationalDate(new Date('2026-11-12T10:00:00Z'));
assert('Days of week [1, 4] is scheduled on Thu by regular cadence', isTaskScheduledForDate(daysTask, opThuNov12));

// 3. One-time task
const oneTimeTask = {
  id: 'task_once',
  userId: 'usr_1',
  title: 'Pay Taxes',
  flavor: 'one_time',
  frequency: 'one_time',
  targetDate: '2026-11-10',
  createdAt: '2026-11-01T10:00:00Z',
  lifecycleStatus: 'active',
};
assert('One-time task rolls forward when uncompleted past target date', shouldTaskRollForward(oneTimeTask, opWedNov11, []));

const eventOneTimeComplete = [{
  id: 'evt_4',
  userId: 'usr_1',
  taskId: 'task_once',
  status: 'completed',
  targetDate: '2026-11-10',
  occurredAt: '2026-11-10T15:00:00Z',
}];
assert('One-time task does NOT roll forward when completed', !shouldTaskRollForward(oneTimeTask, opWedNov11, eventOneTimeComplete));

// 4. Monthly task (Day 5)
const monthlyTask = {
  id: 'task_month',
  userId: 'usr_1',
  title: 'Rent Payment',
  flavor: 'checklist',
  frequency: 'monthly',
  dayOfMonth: 5,
  createdAt: '2026-11-01T10:00:00Z',
  lifecycleStatus: 'active',
};
const opNov6 = getOperationalDate(new Date('2026-11-06T10:00:00Z'));
assert('Monthly task rolls forward to Day 6 when uncompleted on Day 5', shouldTaskRollForward(monthlyTask, opNov6, []));

console.log(`\n🎉 ALL ${passed}/${total} ROLLOVER ENGINE TESTS PASSED!`);
