import { useTable } from "react-table";
import React, { useEffect, useState } from "react";

type MissionProgressProps = {
  test: boolean;
};

// const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
const API_URL = "http://localhost:3000";

interface row {
  user_id: string;
  action: string;
  target_id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  data: string;
  hash: string;
}

export default function AuditLogs({ test }: MissionProgressProps) {
  const test_data = [
    {
      user_id: "a1",
      action: "test",
      target_id: "b2",
      timestamp: "now",
      ip_address: "1234",
      user_agent: "idk",
      data: "jsonstr",
      hash: "2rvTy6",
    },
  ];
  const [data, setData] = useState<row[] | null>([]); // ✅ This is valid

  const [modalData, setModalData] = useState(null);
const [isModalOpen, setModalOpen] = useState(false);

const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
};




  async function getAuditLogs() {    
    const res = await fetch(`${API_URL}/auditlogs`); // /${id}

    if (!res.ok) {
      throw new Error(`Failed to fetch mission `);
    }

    const raw = await res.json();
    const data: row[] = raw;

    setData(data);

    console.log("fetched mission objectives");
    console.log(data);

    return data;
  }

  const columns = React.useMemo(
    () => [
      { Header: "Timestamp", accessor: "timestamp" },
      { Header: "User ID", accessor: "user_id" },
      { Header: "Action", accessor: "action" },
      { Header: "Target ID", accessor: "target_id" },
      { Header: "IP Address", accessor: "ip_address" },
      { Header: "User Agent", accessor: "user_agent" },
      {
        Header: "Details",
        accessor: "data",
        Cell: ({ value }) => (
          <button onClick={() => openModal(value)}>View</button>
        ),
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  useEffect(() => {
    console.log("get audit logs ran");
    getAuditLogs();

    return () => {
      // cleanup code (like removing event listeners)
    };
  }, [test]);

  return (<>

  {isModalOpen ? (
  <div className="modal-backdrop">
    <div className="modal">
      <pre>{JSON.stringify(modalData, null, 2)}</pre>
      <button onClick={() => setModalOpen(false)}>Close</button>
    </div>
  </div>
) :(
     <table
      {...getTableProps()}
      style={{ border: "1px solid black", width: "100%" }}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps()}
                style={{ borderBottom: "2px solid black", padding: "0.5rem" }}
              >
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td
                  {...cell.getCellProps()}
                  style={{ padding: "0.5rem", borderBottom: "1px solid gray" }}
                >
                  {cell.render("Cell")}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>

)

}
    
    

    </>
  );
}
