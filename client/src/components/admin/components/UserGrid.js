import { DataGrid } from "@mui/x-data-grid";

import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
// import { makeStyles } from '@mui/styles';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { MdBlock } from "react-icons/md";
import { toast } from "react-toastify";
import { AiOutlineCheck } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import { TbUserCheck } from "react-icons/tb";
import { TbLockOpen } from "react-icons/tb";
import { TbLock } from "react-icons/tb";
import {formatDate} from "../../../utils/formatDate";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const apis = {
  All: `/api/auth/all`,
  Reported: `/api/auth/all-reported`,
  Blocked: `/api/auth/all-blocked`,
  Pending: `/api/auth/all-pending`,
};

const UserGrid = ({ option }) => {
  const { autoFetch } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [listUser, setListUser] = useState([]);
  const [totalUser, setTotalUser] = useState(0);

  useEffect(() => {
    getAllUsers();
  }, [option]);

  const getAllUsers = async () => {
    try {
      const { data } = await autoFetch.get(apis[option]);
      setTotalUser(data.numberUsers);
      //   setListUser(data.users);
      const array = data.users.map((v, index) => {
        return {
          // @ts-ignore
          id: v._id,
          no: index + 1,
          // @ts-ignore
          avatar: v.image?.url,
          // @ts-ignore
          name: v.name,
          // @ts-ignore
          email: v.email,
          // postNumber: "n/a",
          // @ts-ignore
          follower: v.follower?.length,
          // @ts-ignore
          role: v.role,
          // @ts-ignore
          date: formatDate(v.createdAt),
          status: v.blocked,
          // block: ()=> (<MdBlock onClick={handleSuspend}/>)
        };
      });
      setListUser(array);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "no", headerName: "No.", width: 20 },
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "info",
      headerName: "Info",
      width: 90,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-x-2">
          <img className="rounded-full w-6 h-6" src={params.row.avatar} />
          <div>{params.row.name}</div>
        </div>
      ),
    },
    { field: "email", headerName: "Email", width: 90, flex: 1 },
    { field: "follower", headerName: "Follower", width: 90 },
    {
      field: "role",
      headerName: "Role",
      width: 20,
      renderCell: (params) => (
        <TiTick
          className={`text-lg rounded-full text-white ${
            params.row.role === 1
              ? `bg-greenBtn`
              : params.row.role === 2
              ? `bg-sky-900`
              : params.row.role === 0
              ? `bg-yellow-900`
              : `hidden`
          }`}
        />
      ),
    },
    {
      field: "verify",
      headerName: "Verify",
      width: 20,
      renderCell: () => <TbUserCheck />,
    },
    { field: "date", headerName: "Date", width: 90 },
    {
      field: "status",
      headerName: "Blocked status",
      width: 90,
      renderCell: (params) => (
        <span
          className={
            params.row.status === "Blocked"
              ? `text-red-900`
              : params.row.status === "Reported"
              ? `text-yellow-900`
              : ``
          }
        >
          {params.row.status}
        </span>
      ),
    },
    {
      field: "unblock",
      headerName: "Unblock",
      width: 20,
      renderCell: () => <TbLockOpen />,
    },
    {
      field: "block",
      headerName: "Block",
      width: 20,
      renderCell: () => <TbLock />,
    },
  ];

  const handleBlock = async (id) => {
    if (!window.confirm("Do you want to block this user")) return;

    try {
      const { data } = await autoFetch.patch(`/api/auth/block/`, {
        userId: id,
      });
      toast("Block user successfully!");
      getAllUsers();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Do you want to unlock this user")) return;
    try {
      const { data } = await autoFetch.patch(`/api/auth/unblock/`, {
        userId: id,
      });
      toast("Unblock user successfully!");
      getAllUsers();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Do you want to verify this user")) return;

    try {
      const { data } = await autoFetch.patch(`/api/auth/verify`, {
        userId: id,
      });
      toast("Verify user successfully!");
      getAllUsers();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleCellClick = (params) => {
    if (params.field === "block") return handleBlock(params.row.id);
    if (params.field === "unblock") return handleUnblock(params.row.id);
    if (params.field === "verify") return handleVerify(params.row.id);

    return navigate(`/profile/${params.row.id}`);
  };

  if (loading)
    return (
      <div className="w-full flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );

  return (
    <ThemeProvider theme={darkTheme}>
      <DataGrid
        //    className="!bg-dialogue !text-mainText"
        rows={listUser}
        columns={columns}
        //   pageSize={25}
        // autoPageSize={true}
        //   pageSizeOptions=	{[5,10,100]}
        sx={{
          "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell,": {
            backgroundColor: "#445566",
            color: "#ccd7ff",
            //  fontWeight: 700,
          },
          // disable cell selection style
          ".MuiDataGrid-cell:focus": {
            outline: "none",
          },
          // pointer cursor on ALL rows
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
        checkboxSelection={false}
        disableSelectionOnClick
        // experimentalFeatures={{ newEditingApi: true }}
        onCellClick={handleCellClick}
      />
    </ThemeProvider>
  );
};

export default UserGrid;
