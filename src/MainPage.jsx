import React, { useCallback, useState, useEffect, useMemo } from "react";
import DateRangePicker from "./DateRangePicker/DateRangePicker";
import { Details } from "./Data/dummyData";
import Datatable from "./DataTable/DataTable";
import { parse } from "date-fns";
import "./App.css";

const MainPage = () => {
  const [tableData, setTableData] = useState([]);
  const [date, setDate] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
  }, [date]);

  const normalize = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getDetails = useCallback(() => {
    if (date?.start && date?.end && Details?.length) {
      const start = new Date(date.start);
      const end = new Date(date.end);
      let filteredData = Details?.filter((item) => {
        const itemDate = parse(item.date, "dd-MM-yyyy", new Date());
        return itemDate >= normalize(start) && itemDate <= normalize(end);
      });

      setTableData(filteredData);
    } else {
      setTableData([]);
    }
    setShow(true);
  }, [Details, date]);

  let headerData = useMemo(() => {
    return [
      {
        prop: "slNo",
        title: "Sl. No.",
        name: "center-aligned",
      },
      {
        prop: "name",
        title: "Name",
        name: "center-aligned",
        filterable: true,
        sortable: true,
        sortableType: "string",
      },
      {
        prop: "date",
        title: "Date",
        name: "center-aligned",
        filterable: true,
      },
      {
        prop: "amount",
        title: "Amount",
        name: "center-aligned",
        filterable: true,
        sortable: true,
        sortableType: "number",
      },
      {
        prop: "status",
        title: "Status",
        name: "center-aligned",
        filterable: true,
      },
    ];
  }, [tableData]);

  let bodyData = useMemo(() => {
    let data = [];
    if (tableData.length) {
      tableData.map((r, i) =>
        data.push({
          slNo: [
            {
              value: i + 1,
              name: "center_aligned",
            },
          ],
          date: [
            {
              value: r?.date || "--",
              name: "center_aligned",
              filterableValue: r?.date || "",
            },
          ],
          name: [
            {
              value: r?.name || "--",
              name: "center_aligned",
              sortableValue: r?.name || "",
              filterableValue: r?.name || "",
            },
          ],
          status: [
            {
              value: r?.status ? (
                <div className={`status-container ${r?.status}`}>
                  {r?.status}
                </div>
              ) : (
                "--"
              ),
              name: "center_aligned",
              filterableValue: r?.status || "",
            },
          ],
          amount: [
            {
              value: r?.amount || "--",
              name: "center_aligned",
              sortableValue: r?.amount || "",
              filterableValue: r?.amount || "",
            },
          ],
        })
      );
    }
    return data;
  }, [tableData]);

  return (
    <div className="main_page_container">
      <div className="header_container">
        <img src="/logo.png" alt="L" />
      </div>
      <div className="data-container">
        <DateRangePicker setMainDate={setDate} />
        <button className="fetch-details-button" onClick={getDetails}>
          Fetch Details
        </button>
      </div>
      {show ? (
        <Datatable
          headerData={headerData}
          bodyData={bodyData}
          colSpan="5"
          pagination={10}
          paginationOpts={[5, 10, 20, 50, 100]}
        />
      ) : null}
    </div>
  );
};

export default MainPage;
