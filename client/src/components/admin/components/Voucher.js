import { useEffect, useState } from "react";
import { useAppContext } from "../../../context/useContext";

import ReactLoading from "react-loading";
import { toast } from "react-toastify";

import VoucherForm from "../../common/VoucherForm";

import formatDate from "../../../utils/formatDate";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
//icons
import { AiOutlineEdit } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Voucher = ({}) => {
  const { autoFetch } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [listVoucher, setListVoucher] = useState([]);

  const [newVoucherFormOpen, setNewVoucherFormOpen] = useState(false);
  const [editVoucherFormOpen, setEditVoucherFormOpen] = useState(false);
  const [voucherFormData, setVoucherFormData] = useState({ code: [] });

  useEffect(() => {
    getAllVouchers();
  }, []);

  const getAllVouchers = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/voucher/all`);
      const array = data.vouchers.map((v, index) => {
        return {
          id: v._id,
          no: index + 1,
          name: v?.name,
          points: v?.points,
          description: v?.description,
          code: v?.code,
          code_number: v?.code.length,
          date: formatDate(v?.createdAt),
        };
      });
      setListVoucher(array);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "no", headerName: "No.", width: 20 },
    { field: "id", headerName: "ID", width: 50, flex: 1 },
    { field: "name", headerName: "Name", width: 90, flex: 1 },
    { field: "points", headerName: "Points", width: 90 },
    { field: "description", headerName: "Description", width: 90, flex: 1 },
    { field: "code_number", headerName: "Number of codes", width: 50 },
    { field: "date", headerName: "Date", width: 90, flex: 1 },
    {
      field: "edit",
      headerName: "Edit",
      width: 40,
      renderCell: () => <AiOutlineEdit />,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 40,
      renderCell: () => <FiTrash />,
    },
  ];
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this voucher?")) return;
    setLoading(true);
    try {
      const { data } = await autoFetch.delete(`/api/voucher/${id}`);
      toast.success("Delete successfully!");
      getAllVouchers();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (params) => {
    if (params.field === "edit") {
      setVoucherFormData(params.row);
      setEditVoucherFormOpen(true);
    } else if (params.field === "delete") handleDelete(params.row.id);
    else return;
  };



  if (loading)
    return (
      <div className="w-full flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );


    //main return
  return (
    <div>
      {newVoucherFormOpen && (
        <VoucherForm setOpen={setNewVoucherFormOpen} handler={getAllVouchers} />
      )}

      {editVoucherFormOpen && (
        <VoucherForm
          setOpen={setEditVoucherFormOpen}
          handler={getAllVouchers}
          old={voucherFormData}
        />
      )}

      <div>
        <button
          className="primary-btn w-[100px] ml-auto mb-4"
          onClick={() => {
            setNewVoucherFormOpen(true);
          }}
        >
          Create
        </button>
      </div>

      <ThemeProvider theme={darkTheme}>
        <DataGrid
          rows={listVoucher}
          columns={columns}
          sx={{
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell,": {
              backgroundColor: "#445566",
              color: "#ccd7ff",
            },
            ".MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
          checkboxSelection={false}
          disableSelectionOnClick
          onCellClick={handleCellClick}
        />
      </ThemeProvider>
    </div>
  );
};

export default Voucher;
