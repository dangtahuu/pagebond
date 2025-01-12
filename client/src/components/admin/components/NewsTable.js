import { DataGrid } from "@mui/x-data-grid";

import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiTrash } from "react-icons/fi";
import { TbLockOpen, TbUserCheck } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import { formatDate } from "../../../utils/formatDate";
import ReportInfo from "./ReportInfo";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const NewsTable = ({ menu, option }) => {
  const apis = {
    All: `/api/post/all?type=News`,
    Pending: `/api/post/all-pending?type=News`,
    Reported: `/api/post/all-reported?type=News`,
  };

  const { autoFetch } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [listPost, setListPost] = useState([]);
  const [reportId, setReportId] = useState("");
  const [openReportModal, setOpenReportModal] = useState(false);

  useEffect(() => {
    getAllPosts();
  }, [option]);

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
    { field: "id", headerName: "ID", width: 90, flex: 1 },
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
    { field: "title", headerName: "Title", width: 90, flex: 1 },
    { field: "text", headerName: "Text", width: 90, flex: 1 },
    { field: "likes", headerName: "Likes", width: 20 },
    { field: "comments", headerName: "Comments", width: 20 },
    {
      field: "type",
      headerName: "Verified?",
      width: 20,
      renderCell: (params) => (
        <TiTick
          className={`text-lg rounded-full text-white ${
            params.row.type === 1
              ? `bg-greenBtn`
              : params.row.type === 2
              ? `bg-sky-900`
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
    { field: "date", headerName: "Date", width: 90, flex: 1 },
    {
      field: "status",
      headerName: "Reported status",
      width: 20,
      renderCell: (params) => (
        <span className={params.row.status === true ? `text-yellow-900` : ``}>
          {params.row.status === true ? `True` : `False`}
        </span>
      ),
    },
    {
      field: "dismiss",
      headerName: "Dismiss report",
      width: 20,
      renderCell: () => <TbLockOpen />,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 20,
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
      title: v?.detail?.title,
      type: v.type,
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
    if (!window.confirm("Do you want to delete this post")) return;

    try {
      const { data } = await autoFetch.delete(`/api/news/admin/delete/${id}`);
      toast("Delete successfully!");
      getAllPosts();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleDismiss = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/news/unreport`, {
        postId: id,
      });
      toast("Dismiss report successfully!");
      getAllPosts();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleVerify = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/news/verify`, {
        postId: id,
      });
      toast("Verify successfully!");
      getAllPosts();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleCellClick = (params) => {
    if (params.field === "dismiss") return handleDismiss(params.row.id);
    if (params.field === "delete") return handleDelete(params.row.id);
    if (params.field === "verify") return handleVerify(params.row.id);
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
      {openReportModal && (
        <ReportInfo
          id={reportId}
          type="Post"
          setOpenModal={setOpenReportModal}
        />
      )}

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

export default NewsTable;
