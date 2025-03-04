import { MatchMode } from 'types/mainType';
import { Slot } from 'types/matchTypes';
import MatchSlot from './MatchSlot';
import styles from 'styles/match/MatchSlotList.module.scss';

interface MatchSlotListProps {
  type: string;
  toggleMode?: MatchMode;
  matchSlots: Slot[];
}

export default function MatchSlotList({
  type,
  toggleMode,
  matchSlots,
}: MatchSlotListProps) {
  const slotTime = new Date(matchSlots[0].time);
  const slotHour = slotTime.getHours();
  const slotHourIn12 = ChangeHourFrom24To12(slotHour);

  return (
    <>
      <div className={styles.slotHour}>
        {slotHourIn12}
        {slotHourIn12 === '오전  12시' && (
          <div>{`${slotTime.getMonth() + 1}월 ${slotTime.getDate()}일`}</div>
        )}
      </div>
      <div className={styles.slotGrid}>
        {matchSlots.map((slot) => (
          <MatchSlot
            key={slot.slotId}
            type={type}
            toggleMode={toggleMode}
            slot={slot}
          ></MatchSlot>
        ))}
      </div>
    </>
  );
}

function ChangeHourFrom24To12(hour: number) {
  return `${hour < 12 ? '오전 ' : '오후 '} ${
    hour % 12 === 0 ? 12 : hour % 12
  }시`;
}
