import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/useContext";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { formatDateYearFirst } from "../../utils/formatDate";


const ReviewForm = ({
  setOpenModal,
  current,
}) => {
  const { autoFetch, user } = useAppContext();
  
  const initInput = {
    title: current?.title || "",
    author: current?.author || "",
    image: {url: current?.thumbnail} || "",
    googleBookId: current?.googleBookId || "",
    description: current?.description || "",
    genres: current?.genres? current.genres.join(',') : "",
    publisher: current?.publisher || "",
    publishedDate: current?.publishedDate ? formatDateYearFirst(current?.publishedDate)
    : "",
    previewLink: current?.previewLink || "",
    pageCount: current?.pageCount || "",
  };

  const [input, setInput] = useState(initInput);
  const [image, setImage] = useState(initInput.image);
  const [attachment, setAttachment] = useState(initInput.image);
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  
  const handleImage = async (e) => {
    setImageLoading(true);
    try {
      setImage(null);
      const file = e.target.files[0];
      // @ts-ignore
      setImage({ url: URL.createObjectURL(file) });

      let formData = new FormData();
      formData.append("image", file);

      setFormData(formData);
    } catch (error) {
      console.log(error);
    }
    setImageLoading(false);
  };

  const handleButton = () => {
  if(!input.title||!input.author) {
    return toast.error("Please fill out title and author!");
  }
    if (current) {
      // Edit post
      updatePost();
    } else {
      // Create post
      // @ts-ignore
      createNewBook();
    }
    setInput({ initInput });
    setOpenModal(false);
    setAttachment("");
    setFormData(null);
  };

  const createNewBook = async () => {
    try {
      let image = null;
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }
      const { data } = await autoFetch.post(`api/book/create`, {
        title: input.title,
        author: input.author,
        thumbnail: image,
        googleBookId: input.googleBookId,
        description: input.description,
        genres: input.genres,
        publisher: input.publisher,
        publishedDate: input.publishedDate,
        previewLink: input.previewLink,
        pageCount: input.pageCount,
      });
      toast.success("Create book successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const updatePost = async () => {
    try {
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }
      let postData;

      const { data } = await autoFetch.patch(`api/book/edit/${current.id}`, {
        title: input.title,
        author: input.author,
        thumbnail: image,
        googleBookId: input.googleBookId,
        description: input.description,
        genres: input.genres,
        publisher: input.publisher,
        publishedDate: input.publishedDate,
        previewLink: input.previewLink,
        pageCount: input.pageCount,
      });

   
      toast("Update book successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.msg || "Something went wrong");
    } finally {
      setFormData(null);
    }
  };

  const uploadImage = () => {
    if (image) {
      return (
        <div className="h-full relative group ">
          <img
            // @ts-ignore
            src={image.url}
            alt="xasdws"
            className="flex items-center rounded-lg justify-center max-h-full "
          />
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 hidden group-hover:flex mb-1 z-[203] cursor-pointer "
            onClick={() => {
              setImage(null);
              setInput((prev) => ({ ...prev, image: null }));
              setFormData(null);
            }}
          />
        </div>
      );
    }
    if (imageLoading) {
      return (
        <div className="flex items-center justify-center w-full h-full ">
          <ReactLoading
            type="spinningBubbles"
            color="#6A7583"
            height={50}
            width={50}
          />
        </div>
      );
    }
    return (
      <>
        <div className="w-full h-full rounded-md flex flex-col items-center justify-center relative bg-inputBg group-hover:bg-[#d9dadc]/60">
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 cursor-pointer mb-1 z-[203] "
            onClick={() => {
              setAttachment("");
            }}
          />
          <div>
            <MdAddPhotoAlternate className="w-8 h-8 rounded-full dark:bg-[#5A5C5C] p-1.5 text-black/60 bg-[#D8DADF] " />
          </div>
          <div className="font-semibold text-base leading-5 text-black/60 mt-2 ">
            Add photos
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="absolute w-full h-full top-0 left-0 z-[201] cursor-pointer opacity-0 "
          onChange={(e) => handleImage(e)}
        />
      </>
    );
  };

  
  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
            setOpenModal(false);
        }}
      ></div>
      <div className="mx-auto w-[80%] max-h-[90%] overflow-auto style-3 bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue">
            {current ? `Edit book` : `Create book`}
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <div className="col-span-1">
              <label className="form-label mt-3" for="title">
                Title
              </label>
              <input
                id="title"
                value={input.title}
                className={`standard-input`}
                placeholder={`Title`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, title: e.target.value }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="author">
                Author
              </label>
              <input
                id="author"
                value={input.author}
                className={`standard-input`}
                placeholder={`Author`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, author: e.target.value }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="googleBookId">
                Google Book Id
              </label>
              <input
                id="googleBookId"
                value={input.googleBookId}
                className={`standard-input`}
                placeholder={`Google Book Id`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, googleBookId: e.target.value }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="genres">
                Genres
              </label>
              <input
                id="genres"
                value={input.genres}
                className={`standard-input`}
                placeholder={`Genres`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, genres: e.target.value }));
                }}
              />
            </div>

      

            <div className="col-span-2">
              <label className="form-label mt-3" for="description">
                Description
              </label>
              <textarea
                id="description"
                value={input.description}
                className={`standard-input h-[100px]`}
                placeholder={`Description`}
                onChange={(e) => {
                  setInput((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
            </div>

        

            <div className="col-span-1">
              <label className="form-label mt-3" for="publisher">
                Publisher
              </label>
              <input
                id="publisher"
                value={input.publisher}
                className={`standard-input`}
                placeholder={`Publisher`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, publisher: e.target.value }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="publishedDate">
                Published Date
              </label>
              <input
                id="publishedDate"
                type="date"
                value={input.publishedDate}
                className={`standard-input`}
                placeholder={`Published Date`}
                onChange={(e) => {
                  setInput((prev) => ({
                    ...prev,
                    publishedDate: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="previewLink">
                Preview Link
              </label>
              <input
                id="previewLink"
                value={input.previewLink}
                className={`standard-input`}
                placeholder={`Preview Link`}
                onChange={(e) => {
                  setInput((prev) => ({
                    ...prev,
                    previewLink: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="form-label mt-3" for="pageCount">
                PageCount
              </label>
              <input
                id="pageCount"
                value={input.pageCount}
                className={`standard-input`}
                placeholder={`PageCount`}
                onChange={(e) => {
                  setInput((prev) => {
                    const newValue = e.target.value.replace(/[^0-9]/g, "");

                    return { ...prev, pageCount: newValue };
                  });
                }}
              />
            </div>
          </div>

          {attachment && (
            <div className="relative flex w-full h-[100px] rounded-lg group mt-2">
              {uploadImage()}
            </div>
          )}
          {!attachment && (
            <div className="flex items-center cursor-pointer">
              <label className="form-label cursor-pointer" for="">
                Attachment
              </label>

              <MdOutlineAddPhotoAlternate
                className="text-xl ml-2"
                onClick={() => {
                  setAttachment("photo");
                }}
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-2 mb-3">
            <div></div>
            <button
              className={`primary-btn w-[100px] block`}
              onClick={handleButton}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
