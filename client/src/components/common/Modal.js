import { IoClose } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

const Modal = ({ text, name, setOpenModal }) => {
  const handleButton = () => {
    setOpenModal(false);
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          setOpenModal(false);
        }}
      ></div>
      <div className="mx-auto w-[60%] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div>
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
            {name}
          </div>
          <div className="text-sm my-3">
            <ReactMarkdown>{text.replace(/\[\^\d+\^\]/g, "")}</ReactMarkdown>
          </div>
          <button
            className={`primary-btn w-[100px] ml-auto block mb-3`}
            onClick={handleButton}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
