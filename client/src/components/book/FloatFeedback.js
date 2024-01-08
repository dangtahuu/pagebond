import { MdOutlineFeedback } from "react-icons/md";
import SimpleForm from "../common/SimpleForm";
import { useState } from "react";
import { useAppContext } from "../../context/useContext";
import { toast } from "react-toastify";

const FloatFeedback = ({id}) => {
  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  const { autoFetch, user } = useAppContext();

  const handleReport = async () => {
    if (!reportText) return;

    try {
      const { data } = await autoFetch.patch(`/api/book/report`, {
        bookId: id,
        text: reportText,
      });
      toast.success(
        "Report successfully! An admin will look into your request soon"
      );
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  return (
    <div>
      {openReportModal && (
        <SimpleForm
          text={reportText}
          title="Feedback"
          setOpenModal={setOpenReportModal}
          setText={setReportText}
          submitHandle={handleReport}
          isEditPost={true}
          label="Feedback"
          placeholder="Tell us what information can be improved on this page"
        />
      )}
      <div className="fixed bottom-3 right-2">
        <div className="rounded-full w-8 h-8 bg-greenBtn flex justify-center items-center cursor-pointer"
        onClick={()=>{
            setOpenReportModal(true)
        }}>
          <MdOutlineFeedback />
        </div>
      </div>
    </div>
  );
};

export default FloatFeedback;
