import { useEffect, useState } from 'react';
import instance from 'utils/axios';
import styles from 'styles/admin/scheduler/SchedulerEdit.module.scss';
import SchedulerCurrent from './SchedulerCurrent';
import SchedulerPreview from './SchedulerPreview';

type EditedSchedule = {
  viewTimePast: number;
  viewTimeFuture: number;
  gameTime: number;
  blindShowTime: number;
  futurePreview: number;
};

type Match = {
  intervalMinute: number;
  matchBoards: Slots[][];
};

type Slots = {
  slotId: number;
  status: string;
  headCount: number;
  time: string;
  mode: string;
};

export default function SchedulerMain() {
  const [scheduleInfo, setScheduleInfo] = useState<EditedSchedule>({
    viewTimePast: 0,
    viewTimeFuture: 12,
    gameTime: 15,
    blindShowTime: 5,
    futurePreview: 0,
  });

  const [slotInfo, setSlotInfo] = useState<Match>({
    intervalMinute: 0,
    matchBoards: [],
  });

  const [showTime, setShowTime] = useState<number>(0);
  const [lastHour, setLastHour] = useState<number>(0);
  const [firstHour, setFirstHour] = useState<number>(0);
  const currentHour = new Date().getHours();
  const initScheduleInfo = async () => {
    try {
      // const res = await instance.get(``); //ToDo: api 명세 나오면 바꾸기
      // setScheduleInfo(res?.data);
    } catch (e) {
      console.error(e);
    }
  };

  const initSlotInfo = async () => {
    try {
      const res = await instance.get(`/pingpong/match/tables/${1}/rank/single`);
      setSlotInfo({ ...res?.data });
      setShowTime(res?.data.matchBoards.length);
      setFirstHour(
        parseInt(res?.data.matchBoards[0][0].time[11]) * 10 +
          parseInt(res?.data.matchBoards[0][0].time[12])
      );
      setLastHour(
        parseInt(
          res?.data.matchBoards[res?.data.matchBoards.length - 1][0].time[11]
        ) *
          10 +
          parseInt(
            res?.data.matchBoards[res?.data.matchBoards.length - 1][0].time[12]
          ) +
          1
      );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    initScheduleInfo();
    initSlotInfo();
  }, []);

  const inputHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let intValue = parseInt(value);
    if (isNaN(intValue)) intValue = 0;
    if ((name === 'futurePreview' || name === 'blindShowTime') && intValue < 0)
      return;

    setScheduleInfo((prev) => ({
      ...prev,
      [name]: intValue,
    }));
  };

  const gameTimeOptions = Array.from({ length: 60 }, (_, i) => i + 1)
    .filter((num) => 60 % num === 0)
    .map((num) => (
      <option key={'gameTime'} value={num}>
        {num}분
      </option>
    ));

  const pastTimeOptions = Array.from({ length: 4 }, (_, i) => i).map((num) => (
    <option key={'viewTimePast'} value={num}>
      {num}시간
    </option>
  ));

  const futureTimeOptions = Array.from({ length: 23 }, (_, i) => i + 1).map(
    (num) => (
      <option key={'viewTimeFuture'} value={num}>
        {num}시간
      </option>
    )
  );

  return (
    <div className={styles.content}>
      <div className={styles.imgContainer}>
        {slotInfo.matchBoards.length > 0 && (
          <SchedulerCurrent
            slotInfo={slotInfo}
            firstHour={firstHour}
            lastHour={lastHour}
            currentHour={currentHour}
            scheduleInfo={scheduleInfo}
          />
        )}
        {scheduleInfo.viewTimeFuture + scheduleInfo.viewTimeFuture > 0 &&
          showTime > 0 && (
            <SchedulerPreview
              lastHour={lastHour}
              showTime={showTime}
              currentHour={currentHour}
              scheduleInfo={scheduleInfo}
            />
          )}
      </div>
      <div className={styles.inputContainer}>
        <div>
          보여주는 시간: ({scheduleInfo.viewTimePast}시간) 현재 (
          {scheduleInfo.viewTimeFuture}시간)
        </div>
        <div>
          과거
          <select name='viewTimePast' onChange={inputHandler}>
            {pastTimeOptions}
          </select>
          미래
          <select name='viewTimeFuture' onChange={inputHandler}>
            {futureTimeOptions}
          </select>
        </div>
        <div>
          게임 시간
          <select name='gameTime' onChange={inputHandler}>
            {gameTimeOptions}
          </select>
        </div>
        <div>
          블라인드 해제 시간
          <input
            type='number'
            value={scheduleInfo.blindShowTime}
            name='blindShowTime'
            onChange={inputHandler}
          />
        </div>
        <div>
          N시간 후:
          <input
            type='number'
            value={scheduleInfo.futurePreview}
            name='futurePreview'
            onChange={inputHandler}
          />
        </div>
      </div>
    </div>
  );
}
