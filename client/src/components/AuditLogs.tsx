// import { useTable, TableInstance } from "react-table";
// // import type { Column } from "react-table";

// type Column<T extends object> = {
//   Header: string | (() => React.ReactNode);
//   accessor: keyof T | ((row: T) => any);
//   Cell?: (cell: { value: any; row: T; column: any }) => React.ReactNode;
// };


// import React, { useEffect, useState, CSSProperties } from "react";
// import { useAuth } from "../contexts/AuthContext";

// type MissionProgressProps = {
//   trigger: boolean;
// };

// // type CellProps = {
// //   value: string;
// // };

// const API_URL = "http://localhost:3000";

// interface RowData {
//   user_id: string;
//   action: string;
//   target_id: string;
//   timestamp: string;
//   ip_address: string;
//   user_agent: string;
//   data: string;
//   hash: string;
// }

// export default function AuditLogs({ trigger }: MissionProgressProps) {
//   const { user } = useAuth();
//   const [data, setData] = useState<RowData[]>([]);
//   const [modalData, setModalData] = useState<string | null>(null);
//   const [isModalOpen, setModalOpen] = useState(false);

//   const openModal = (value: string) => {
//     setModalData(value);
//     setModalOpen(true);
//   };

//   useEffect(() => {
//     if (!user) setData([]);
//   }, [user]);

//   async function getAuditLogs() {
//     const res = await fetch(`${API_URL}/auditlogs`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${user?.token}`,
//       },
//     });
//     if (!res.ok) throw new Error("Failed to fetch audit logs");
//     const raw: RowData[] = await res.json();
//     setData(raw);
//     return raw;
//   }

//   const columns: Column<RowData>[] = React.useMemo(
//     () => [
//       { Header: "Timestamp", accessor: "timestamp" },
//       { Header: "User ID", accessor: "user_id" },
//       { Header: "Action", accessor: "action" },
//       { Header: "Target ID", accessor: "target_id" },
//       { Header: "IP Address", accessor: "ip_address" },
//       {
//         Header: "User Agent",
//         accessor: "user_agent",
//          Cell: ({ value }: { value: string }) => (
//     <button onClick={() => openModal(value)}>View</button>
//   ),
//       },
//       {
//         Header: "Details",
//         accessor: "data",
//         Cell: ({ value }: { value: any }) => (
//     <button
//       onClick={() =>
//         openModal(
//           typeof value === "string" ? value : JSON.stringify(value, null, 2)
//         )
//       }
//     >
//       View
//     </button>
//   ),
//       },
//     ],
//     [],
//   );
// const tableInstance: TableInstance<RowData> = useTable<RowData>({ columns, data });

// const {
//   getTableProps,
//   getTableBodyProps,
//   headerGroups,
//   rows,
//   prepareRow,
// } = tableInstance;


//   useEffect(() => {
//     getAuditLogs();
//   }, [trigger]);

//   return (
//     <div style={styles.bodyport}>
//       {isModalOpen ? (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <pre>{modalData}</pre>
//             <button onClick={() => setModalOpen(false)}>Close</button>
//           </div>
//         </div>
//       ) : (
//         <table {...getTableProps()} style={styles.table}>
//           <thead>
//             {headerGroups.map((headerGroup) => (
//               <tr {...headerGroup.getHeaderGroupProps()} style={styles.trtest}>
//                 {headerGroup.headers.map((column) => (
//                   <th {...column.getHeaderProps()} style={styles.thtest}>
//                     {column.render("Header")}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody {...getTableBodyProps()}>
//             {rows.map((row) => {
//               prepareRow(row);
//               return (
//                 <tr {...row.getRowProps()}>
//                   {row.cells.map((cell) => (
//                     <td
//                       {...cell.getCellProps()}
//                       style={{
//                         padding: "0.5rem",
//                         borderBottom: "1px solid gray",
//                       }}
//                     >
//                       {cell.render("Cell")}
//                     </td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// const styles: { [key: string]: CSSProperties } = {
//   table: {
//     border: "1px solid black",
//     width: "100%",
//     borderCollapse: "collapse",
//     tableLayout: "fixed",
//   },
//   bodyport: {
//     height: "1000px",
//     overflowY: "auto",
//     border: "1px solid black",
//   },
//   trtest: {
//     borderBottom: "2px solid black",
//   },
//   thtest: {
//     position: "sticky",
//     top: 0,
//     zIndex: 10,
//     borderBottom: "2px solid black",
//     padding: "0.5rem",
//   },
// };
