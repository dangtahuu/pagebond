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
import { FiTrash } from "react-icons/fi";
import { TbLockOpen } from "react-icons/tb";
import { formatDate } from "../../../utils/formatDate";
import ReportInfo from "./ReportInfo";

const bigMenuToType = {
  Posts: "Post",
  Reviews: "Review",
  Trades: "Trade",
  Questions: "Question",
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const PostTable = ({ menu, option }) => {
  const apis = {
    All: `/api/post/all?type=${bigMenuToType[menu]}`,
    Reported: `/api/post/all-reported?type=${bigMenuToType[menu]}`,
  };

  const { autoFetch } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [listPost, setListPost] = useState([]);
  const [reportId, setReportId] = useState("");
  const [openReportModal, setOpenReportModal] = useState(false);

  useEffect(() => {
    getAllPosts();
  }, [menu, option]);

  const getAllPosts = async () => {
    try {
      const { data } = await autoFetch.get(apis[option]);
      setListPost(data.posts);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "no", headerName: "No.", width: 20 },
    { field: "id", headerName: "ID", width: 90 },
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
    { field: "text", headerName: "Text", width: 90, flex: 1 },
    { field: "likes", headerName: "Likes", width: 20 },
    { field: "comments", headerName: "Comments", width: 20 },

    { field: "date", headerName: "Date", width: 90, flex: 1 },
    {
      field: "status",
      headerName: "Reported status",
      width: 70,
      renderCell: (params) => (
        <span className={params.row.status === true ? `text-yellow-900` : ``}>
          {params.row.status === true ? `True` : `False`}
        </span>
      ),
    },
    {
      field: "dismiss",
      headerName: "Dismiss report",
      width: 70,
      renderCell: () => <TbLockOpen />,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 70,
      renderCell: () => <FiTrash />,
    },
  ];

  const data = listPost.map((v, index) => {
    return {
      // @ts-ignore
      id: v._id,
      no: index,
      // @ts-ignore
      avatar: v.postedBy.image?.url,
      // @ts-ignore
      name: v.postedBy.name,
      // @ts-ignore
      // postNumber: "n/a",
      // @ts-ignore
      text: v.text,
      // @ts-ignore
      likes: v.likes.length,
      // @ts-ignore
      comments: v.comments.length,
      date: formatDate(v.createdAt),
      status: v.reported,
    };
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this post?")) return;

    try {
      const { data } = await autoFetch.delete(`/api/post/admin/delete/${id}`);
      toast("Delete successfully!");
      getAllPosts();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleDismiss = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/post/unreport`, {
        postId: id,
      });
      toast("Dismiss report successfully!");
      getAllPosts();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleCellClick = (params) => {
    if (params.field === "dismiss") return handleDismiss(params.row.id);
    if (params.field === "delete") return handleDelete(params.row.id);
    if (params.field === "status") {
      setReportId(params.row.id);
      return setOpenReportModal(true);
    }
  };

  if (loading)
    return (
      <div className="w-full flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );

  return (
    <div>
      {openReportModal && <ReportInfo id={reportId} type="Post" setOpenModal={setOpenReportModal}/>}
      <ThemeProvider theme={darkTheme}>
        <DataGrid
          //    className="!bg-dialogue !text-mainText"
          rows={data}
          columns={columns}
          //   pageSize={25}
          // autoPageSize={true}
          //   pageSizeOptions=	{[5,10,20]}
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
    </div>
  );
};

export default PostTable;
