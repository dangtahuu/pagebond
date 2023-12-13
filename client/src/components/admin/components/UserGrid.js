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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const apis = {
    All: `/api/auth/all`,
    Reported: `/api/auth/all-reported`,
    Blocked: `/api/auth/all-blocked`
}

const convertDate = (time) => {
  const date = new Date(time);
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return `${yyyy}-${mm >= 10 ? mm : "0" + mm}-${dd >= 10 ? dd : "0" + dd}`;
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
      const { data } = await autoFetch.get(
       apis[option]
      );
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
          following: v.following?.length,
          // @ts-ignore
          date: convertDate(v.createdAt),
          status: v.blocked,
          // block: ()=> (<MdBlock onClick={handleSuspend}/>)
        };
      });
      setListUser(array)
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "no", headerName: "No.", width: 20, flex: 1 },
    { field: "id", headerName: "ID", width: 90, flex: 1 },
    {
      field: "avatar",
      headerName: "Avatar",
      width: 90,
      flex: 1,
      renderCell: (params) => (
        <img className="rounded-full w-6 h-6" src={params.row.avatar} />
      ),
    },
    { field: "name", headerName: "Name", width: 90, flex: 1 },
    { field: "email", headerName: "Email", width: 90, flex: 1 },
    { field: "follower", headerName: "Follower", width: 90, flex: 1 },
    { field: "following", headerName: "Following", width: 90, flex: 1 },
    { field: "date", headerName: "Date", width: 90, flex: 1 },
    { field: "status", headerName: "Status", width: 90, flex: 1,
    renderCell: (params) => (
        <span className={params.row.status==="Blocked"? `text-red-900`:params.row.status==="Reported"? `text-yellow-900`: ``}>{params.row.status}</span>
      )  },
    {
        field: "unblock",
        headerName: "Unblock",
        width: 90,
        flex: 1,
        renderCell: () => <AiOutlineCheck />,
      },
    {
      field: "block",
      headerName: "Suspend",
      width: 90,
      flex: 1,
      renderCell: () => <MdBlock />,
    },
  ];

  

  const handleBlock = async (id) => {
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

  const handleCellClick = (params) => {
    if (params.field === "block") return handleBlock(params.row.id);
    if (params.field === "unblock")return handleUnblock(params.row.id);
   return navigate(`/profile/${params.row.id}`);
  };

 if(loading)
  return(
<div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
    )

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
