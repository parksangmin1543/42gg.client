import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import PageNation from 'components/Pagination';
import AdminSearchBar from 'components/admin/common/AdminSearchBar';
import instance from 'utils/axios';
import { modalState } from 'utils/recoil/modal';
import { tableFormat } from 'constants/admin/table';
import styles from 'styles/admin/penalty/PenaltyTable.module.scss';
import { getFormattedDateToString } from 'utils/handleTime';

interface IPenalty {
  intraId: string;
  reason: string;
  releaseTime: Date;
}

interface IPenaltyTable {
  penaltyList: IPenalty[];
  totalPage: number;
  currentPage: number;
}

const tableTitle: { [key: string]: string } = {
  intraId: '유저 ID',
  reason: '사유',
  releaseTime: '해제 시간',
  etc: '기타',
};

export default function PenaltyTable() {
  const [penaltyInfo, setPenaltyInfo] = useState<IPenaltyTable>({
    penaltyList: [],
    totalPage: 0,
    currentPage: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [intraId, setIntraId] = useState<string>('');
  const setModal = useSetRecoilState(modalState);

  const handleButtonAction = (intraId: string) =>
    setModal({ modalName: 'ADMIN-PENALTY_DELETE', intraId });

  const initSearch = useCallback((intraId?: string) => {
    setIntraId(intraId || '');
    setCurrentPage(1);
  }, []);

  const getUserPenalty = useCallback(async () => {
    try {
      const res = await instance.get(
        `pingpong/admin/penalty/users?q=${intraId}&page=${currentPage}&size=10`
      );
      setIntraId(intraId);
      setPenaltyInfo({
        penaltyList: res.data.penaltyList.map((penalty: IPenalty) => {
          const { year, month, date, hour, min } = getFormattedDateToString(
            new Date(penalty.releaseTime)
          );
          return {
            ...penalty,
            releaseTime: `${year}-${month}-${date} ${hour}:${min}`,
          };
        }),
        totalPage: res.data.totalPage,
        currentPage: res.data.currentPage,
      });
    } catch (e) {
      console.error('MS07');
    }
  }, [intraId, currentPage]);

  const getAllUserPenalty = useCallback(async () => {
    try {
      const res = await instance.get(
        `pingpong/admin/penalty/users?page=${currentPage}&size=10`
      );
      setIntraId('');
      setPenaltyInfo({
        penaltyList: res.data.penaltyList.map((penalty: IPenalty) => {
          const { year, month, date, hour, min } = getFormattedDateToString(
            new Date(penalty.releaseTime)
          );
          return {
            ...penalty,
            releaseTime: `${year}-${month}-${date} ${hour}:${min}`,
          };
        }),
        totalPage: res.data.totalPage,
        currentPage: res.data.currentPage,
      });
    } catch (e) {
      console.error('MS08');
    }
  }, [currentPage]);

  useEffect(() => {
    intraId ? getUserPenalty() : getAllUserPenalty();
  }, [intraId, getUserPenalty, getAllUserPenalty]);

  return (
    <>
      <div className={styles.penaltyWrap}>
        <div className={styles.header}>
          <span className={styles.title}>패널티 관리</span>
          <AdminSearchBar initSearch={initSearch} />
        </div>
        <TableContainer className={styles.tableContainer} component={Paper}>
          <Table className={styles.table} aria-label='penalty table'>
            <TableHead className={styles.tableHeader}>
              <TableRow>
                {tableFormat['penalty'].columns.map((columnName: string) => (
                  <TableCell
                    key={columnName}
                    className={styles.tableHeaderItem}
                  >
                    {tableTitle[columnName]}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {penaltyInfo.penaltyList.length > 0 ? (
                penaltyInfo.penaltyList.map((penalty: IPenalty) => (
                  <TableRow key={penalty.intraId} className={styles.tableRow}>
                    {tableFormat['penalty'].columns.map(
                      (columnName: string) => (
                        <TableCell
                          key={columnName}
                          className={styles.tableBodyItem}
                        >
                          {columnName !== 'etc'
                            ? penalty[columnName as keyof IPenalty]?.toString()
                            : tableFormat['penalty'].etc?.value.map(
                                (buttonName: string) => (
                                  <button
                                    key={buttonName}
                                    className={styles.button}
                                    onClick={() =>
                                      handleButtonAction(penalty.intraId)
                                    }
                                  >
                                    {buttonName}
                                  </button>
                                )
                              )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>비어있습니다</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className={styles.pageNationContainer}>
          <PageNation
            curPage={penaltyInfo.currentPage}
            totalPages={penaltyInfo.totalPage}
            pageChangeHandler={(pageNumber: number) => {
              setCurrentPage(pageNumber);
            }}
          />
        </div>
      </div>
    </>
  );
}
