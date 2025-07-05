"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./DataTable.css";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";

const Datatable = (props) => {
  const [dropdownValue, setDropdownValue] = useState(props.pagination);
  const [options, setOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [pages, setPages] = useState("");
  const [tableData, setTableData] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    let opt = [];
    let opt1 = [{ name: "10", value: 10 }];
    let listLength = sortedData?.length ? sortedData?.length : 0;
    let options1 = props.paginationOpts ? [...props.paginationOpts] : [];
    if (options1?.length) {
      for (let i = 0; i < options1?.length; i++) {
        if (options1[i] < listLength) {
          opt.push({
            name: options1[i].toString(),
            value: options1[i],
          });
        } else if (options1[i] === listLength) {
          opt.push({
            name: options1[i].toString(),
            value: options1[i],
          });
          break;
        } else {
          opt.push({
            name: options1[i].toString(),
            value: options1[i],
          });
          break;
        }
      }
    }
    opt?.length ? setOptions(opt) : setOptions(opt1);
    if (props.headerData) {
      setHeaderData(props.headerData);
    } else {
      setHeaderData([]);
    }
  }, [props, sortedData]);

  useEffect(() => {
    if (props.bodyData) {
      setSortedData([...props.bodyData]);
    }
  }, [props.bodyData]);

  useEffect(() => {
    let p = 0;
    let pages = [];
    let data = [...sortedData];
    if (dropdownValue !== "") {
      let entries = sortedData?.length;
      let reminder = entries % dropdownValue;
      if (reminder > 0) {
        let p1 = parseInt(entries / dropdownValue);
        p = p1 + 1;
      } else {
        p = parseInt(entries / dropdownValue);
      }
    }
    if (p > 2) {
      pages = [1, 2, 3];
    } else if (p === 2) {
      pages = [1, 2];
    } else {
      pages = [1];
    }
    let data1 = [];
    setPages(p);
    data1 = data?.length && data.slice(0, dropdownValue);
    setCurrentPage(1);
    setPageNumbers(pages);
    setTableData(data1);
  }, [dropdownValue, sortedData]);

  useEffect(() => {
    let inputField = document.getElementById("datatable_search");
    if (inputField !== undefined && inputField !== null) {
      inputField.value = "";
    }
  }, [props.bodyData]);

  const getSortedData = (value) => {
    if (value === "") {
      let newData = [...props.bodyData];
      setSortedData(newData);
    } else {
      let data = [...props.bodyData];
      let header = [...headerData];
      let newData = [];
      data?.length &&
        data.map((r) => {
          if (header?.length) {
            for (let i = 0; i < header?.length; i++) {
              if (
                header[i].filterable !== undefined &&
                header[i].filterable === true
              ) {
                if (r[header[i].prop] !== undefined) {
                  if (
                    r[header[i].prop][0]["filterableValue"]
                      ?.toString()
                      ?.toLowerCase()
                      .includes(value?.toString()?.toLowerCase())
                  ) {
                    newData.push(r);
                    break;
                  }
                }
              }
            }
          }
          return newData;
        });
      setSortedData(newData);
    }
  };

  const onDropdownChange = (e) => {
    setDropdownValue(e.target.value);
    let data = [...sortedData];
    let data1 = data?.length && data.slice(0, e.target.value);
    setTableData(data1);
  };

  const onPagination = (n) => {
    let p = [];
    setCurrentPage(n);
    let data = [...sortedData];
    if (pages > 2) {
      if (n === 1) {
        p = [1, 2, 3];
      } else if (n > 1 && n < pages) {
        p = [n - 1, n, n + 1];
      } else {
        p = [n - 2, n - 1, n];
      }
    } else if (pages === 2) {
      p = [1, 2];
    } else {
      p = [1];
    }
    let data1 =
      data?.length &&
      data.slice(
        n * dropdownValue - dropdownValue,
        n * dropdownValue < sortedData?.length
          ? n * dropdownValue
          : sortedData?.length
      );
    setTableData(data1);
    setPageNumbers(p);
  };

  const onButton = (s) => {
    let n;
    if (s === "prev") {
      n = currentPage - 1;
    } else {
      n = currentPage + 1;
    }
    let p = [];
    setCurrentPage(n);
    let data = [...sortedData];
    if (pages > 2) {
      if (n === 1) {
        p = [1, 2, 3];
      } else if (n > 1 && n < pages) {
        p = [n - 1, n, n + 1];
      } else {
        p = [n - 2, n - 1, n];
      }
    } else if (pages === 2) {
      p = [1, 2];
    } else {
      p = [1];
    }
    let data1 =
      data?.length &&
      data.slice(
        n * dropdownValue - dropdownValue,
        n * dropdownValue < sortedData?.length
          ? n * dropdownValue
          : sortedData?.length
      );
    setTableData(data1);
    setPageNumbers(p);
  };

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  const deb = debounce(getSortedData, 500);

  const debounceLoadData = useCallback(deb, [deb]);

  const onSearchChange = (e) => {
    e.persist();
    debounceLoadData(e.target.value);
  };

  const onSearchIcon = () => {
    document.getElementById("datatable_search").focus();
  };

  const onSort = (sel) => {
    let headers = [...props.headerData];
    let bodyRows = [...props.bodyData];
    headerData.map((r) => {
      if (r.prop === sel) {
        if (r.sort === "asc") {
          let inputFieldValue = "";
          let inputField = document.getElementById("datatable_search");
          if (inputField !== undefined && inputField !== null) {
            inputFieldValue = document.getElementById("datatable_search").value;
          }
          let dataRes = [];
          let dataRes1 = [];
          if (inputFieldValue !== "") {
            bodyRows.map((r1) => {
              if (headers.length) {
                for (let i = 0; i < headers.length; i++) {
                  if (
                    headers[i].filterable !== undefined &&
                    headers[i].filterable === true
                  ) {
                    if (r1[headers[i].prop] !== undefined) {
                      if (
                        r1[headers[i].prop][0]["value"]
                          .toString()
                          .toLowerCase()
                          .includes(inputFieldValue.toString().toLowerCase())
                      ) {
                        dataRes.push(r1);
                        break;
                      }
                    }
                  }
                }
              }
              return dataRes;
            });
          } else {
            dataRes = [...bodyRows];
          }
          if (r.sortableType === "number") {
            dataRes1 = dataRes.sort(function (a, b) {
              return (
                parseFloat(b[r.prop][0].sortableValue) -
                parseFloat(a[r.prop][0].sortableValue)
              );
            });
          } else if (r.sortableType === "string") {
            dataRes1 = dataRes.sort((a, b) =>
              b[r.prop][0].sortableValue.localeCompare(
                a[r.prop][0].sortableValue
              )
            );
          }
          r.sort = "desc";
          setSortedData(dataRes1);
        } else {
          let inputFieldValue = "";
          let inputField = document.getElementById("datatable_search");
          if (inputField !== undefined && inputField !== null) {
            inputFieldValue = document.getElementById("datatable_search").value;
          }
          let dataRes = [];
          let dataRes1 = [];
          if (inputFieldValue !== "") {
            bodyRows.map((r1) => {
              if (headers.length) {
                for (let i = 0; i < headers.length; i++) {
                  if (
                    headers[i].filterable !== undefined &&
                    headers[i].filterable === true
                  ) {
                    if (r1[headers[i].prop] !== undefined) {
                      if (
                        r1[headers[i].prop][0]["value"]
                          .toString()
                          .toLowerCase()
                          .includes(inputFieldValue.toString().toLowerCase())
                      ) {
                        dataRes.push(r1);
                        break;
                      }
                    }
                  }
                }
              }
              return dataRes;
            });
          } else {
            dataRes = [...bodyRows];
          }
          if (r.sortableType === "number") {
            dataRes1 = dataRes.sort(function (a, b) {
              return (
                parseFloat(a[r.prop][0].sortableValue) -
                parseFloat(b[r.prop][0].sortableValue)
              );
            });
          } else if (r.sortableType === "string") {
            dataRes1 = dataRes.sort((a, b) =>
              a[r.prop][0].sortableValue.localeCompare(
                b[r.prop][0].sortableValue
              )
            );
          }
          r.sort = "asc";
          setSortedData(dataRes1);
        }
      } else {
        r.sort = "none";
      }
    });
    setHeaderData(headers);
  };

  return (
    <div className="datatable-container">
      <div className="datatable-header-container">
        <div className="datatable-second-row">
          <React.Fragment>
            <div className="show-entries-dropdown">
              <div className="col1">Show</div>
              <div className="col2">
                <select
                  value={dropdownValue}
                  onChange={onDropdownChange}
                  className="data-table-dropdown"
                >
                  {options.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col3">Items/Page</div>
            </div>
          </React.Fragment>
          <div className="datatable-second-row1">
            <div className="search-input-field-container">
              <SearchIcon className="search-icon" onClick={onSearchIcon} />
              <input
                id="datatable_search"
                onChange={onSearchChange}
                autoComplete="off"
                placeholder={"Search"}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="table-container"
        id="data_table_scroll"
        style={{
          maxHeight: "30rem",
        }}
      >
        <table>
          <thead>
            <tr>
              {headerData?.length
                ? headerData.map((r, i) => (
                    <th key={i} className={r.name ? r.name : ""}>
                      {
                        <div className="datatable-header-con">
                          {r.title}
                          {r.sortable ? (
                            <div
                              className={`sort-icon-con ${r.sort}`}
                              onClick={() => onSort(r.prop)}
                            >
                              <ArrowDropUpOutlinedIcon className="data-table-top-arrow" />
                              <ArrowDropDownOutlinedIcon className="data-table-down-arrow" />
                            </div>
                          ) : null}
                        </div>
                      }
                    </th>
                  ))
                : null}
            </tr>
          </thead>
          <tbody>
            {tableData ? (
              tableData.map((r, i) => (
                <tr key={i}>
                  {headerData
                    ? headerData.map((r1, index) => (
                        <td
                          key={index}
                          className={
                            r[r1.prop] !== undefined
                              ? r[r1.prop][0]["name"]
                                ? r[r1.prop][0]["name"]
                                : ""
                              : ""
                          }
                        >
                          {r[r1.prop] !== undefined
                            ? r[r1.prop][0]["value"]
                            : ""}
                        </td>
                      ))
                    : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={props.colSpan ? props.colSpan : "5"}
                  className="no-data"
                >
                  There is no data to be displayed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sortedData?.length ? (
        <div className="table-pagination-container">
          <div className="txt">
            Show {currentPage * dropdownValue - (dropdownValue - 1)}&nbsp; to{" "}
            {currentPage * dropdownValue < sortedData?.length
              ? currentPage * dropdownValue
              : sortedData?.length}
            &nbsp; of {sortedData?.length} entries
          </div>
          <div className="pag-container">
            {currentPage <= 1 ? (
              <div className="disable txt-con">{`<`}&nbsp;&nbsp;Prev</div>
            ) : (
              <div className="txt-con" onClick={() => onButton("prev")}>
                {`<`}&nbsp;&nbsp;Prev
              </div>
            )}
            <div className="number-container">
              {pageNumbers?.length
                ? pageNumbers.map((r1) => (
                    <div
                      key={r1}
                      onClick={() => onPagination(r1)}
                      className={r1 == currentPage ? "num active" : "num"}
                    >
                      {r1}
                    </div>
                  ))
                : ""}
            </div>
            {pages === currentPage ? (
              <div className="disable txt-con">Next&nbsp;&nbsp;{`>`}</div>
            ) : (
              <div className="txt-con" onClick={() => onButton("next")}>
                Next&nbsp;&nbsp;{`>`}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Datatable;
