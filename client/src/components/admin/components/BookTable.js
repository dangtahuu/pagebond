import { useEffect, useState } from "react";
import { useAppContext } from "../../../context/useContext";

import ReactLoading from "react-loading";
import { toast } from "react-toastify";

import VoucherForm from "../../common/VoucherForm";

import { formatDate } from "../../../utils/formatDate";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
//icons
import { AiOutlineEdit } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";
import BookForm from "../../common/BookForm";
import { TbLockOpen } from "react-icons/tb";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const apis = {
    All: `/api/book/all`,
    Reported: `/api/book/all-reported`,
  };

const BookTable = ({option}) => {
  const { autoFetch } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [listBooks, setListBooks] = useState([]);

  const [openNewBookModal, setOpenNewBookModal] = useState(false);
  const [openEditBookModal, setOpenEditBookModal] = useState(false);
  const [bookData, setbookData] = useState({ code: [] });

  useEffect(() => {
    getAllBooks();
  }, [option]);

  const getAllBooks = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(apis[option]);
      const books = data.books;
      const array = books.map((v, index) => {
        return {
          id: v._id,
          no: index + 1,
          thumbnail: v?.thumbnail,
          title: v?.title,
          author: v?.author,
          rating: v?.rating,
          date: formatDate(v?.publishedDate),
          googleBookId: v?.googleBookId,
          description: v?.description,
          genres: v?.genres,
          publisher: v?.publisher,
          publishedDate: v?.publishedDate,
          previewLink: v?.previewLink,
          pageCount: v?.pageCount,
        };
      });
      setListBooks(array);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "no", headerName: "No.", width: 20 },
    { field: "id", headerName: "ID", width: 50, flex: 1 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      width: 50,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-x-2">
          <img className="rounded-full w-6 h-6" src={params.row.thumbnail} />
        </div>
      ),
    },
    { field: "title", headerName: "Title", width: 90, flex: 1 },
    { field: "author", headerName: "Author", width: 90 },
    { field: "rating", headerName: "Rating", width: 90, flex: 1 },
    { field: "date", headerName: "Date", width: 90, flex: 1 },
    {
      field: "edit",
      headerName: "Edit",
      width: 40,
      renderCell: () => <AiOutlineEdit />,
    },
    {
      field: "dismiss",
      headerName: "Dismiss",
      width: 40,
      renderCell: () => <TbLockOpen />,
    },
  ];
  const handleDismiss = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/book/unreport`, {
        bookId: id,
      });
      toast("Dismiss report successfully!");
      getAllBooks();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };
  //   };

  const handleCellClick = (params) => {
    if (params.field === "edit") {
      setbookData(params.row);
      setOpenEditBookModal(true);
    }
    else if (params.field === "dismiss") handleDismiss(params.row.id);
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
      {openNewBookModal && <BookForm setOpenModal={setOpenNewBookModal} />}

      {openEditBookModal && (
        <BookForm
          setOpenModal={setOpenEditBookModal}
          //   handler={getAllBooks}
          current={bookData}
        />
      )}

      <div>
        <button
          className="primary-btn w-[100px] ml-auto mb-4"
          onClick={() => {
            setOpenNewBookModal(true);
          }}
        >
          Create
        </button>
      </div>

      <ThemeProvider theme={darkTheme}>
        <DataGrid
          rows={listBooks}
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

export default BookTable;
