import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/useContext";

import { toast } from "react-toastify";
import ReactLoading from "react-loading";

//icon
import { IoClose } from "react-icons/io5";


const VoucherForm = ({ old, setOpen, handler }) => {
  const { autoFetch } = useAppContext();

  const initInput = {
    name: "",
    points: "",
    description: "",
    code: "",
  };
  const [input, setInput] = useState( old? {...old,code:old.code.join(",")} : initInput);

  const [loading, setLoading] = useState(false);

  const createHandle = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.post(`/api/voucher/create/`, {
        code: input.code,
        name: input.name,
        description: input.description,
        points: input.points,
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
    handler();
    setLoading(false);
    setOpen(false)
  };
 
  const editHandle = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.patch(`/api/voucher/edit/`, {
        voucherId: old.id,
        code: input.code,
        name: input.name,
        description: input.description,
        points: input.points,
      });
      handler();
      setOpen(false)
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.msg || "Something went wrong");
    } finally {
        setLoading(false);
    }
   
  };

  return (
    <div className="fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          if (!old) {
            setOpen(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[60%] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpen(false);
          }}
        />
        <div>
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
           {old? `Edit voucher`:`Create voucher`} 
          </div>

          <div className="my-2">
          <label className="form-label" for="text">
            Name
          </label>
          <input
            id="text"
            value={input.name}
            className={`standard-input`}
            placeholder={`Give it a name`}
            onChange={(e) => {
              setInput((prev)=>({...prev, name: e.target.value}));
            }}
          />
          </div>
         
          <div className="my-2">
          <label className="form-label" for="points">
            Points
          </label>
          <input
            id="points"
            value={input.points}
            className={`standard-input`}
            placeholder={`Enter the voucher's worth in points`}
            onChange={(e) => {
              setInput((prev)=>({...prev, points: e.target.value}));
            }}
          />
          </div>

          <div className="my-2">
          <label className="form-label" for="description">
            Description
          </label>
          <input
            id="description"
            value={input.description}
            className={`standard-input`}
            placeholder={`Give it a nice description`}
            onChange={(e) => {
              setInput((prev)=>({...prev, description: e.target.value}));
            }}
          />
          </div>

          <div className="my-2">
          <label className="form-label" for="code">
            Code
          </label>
          <textarea
            id="code"
            value={input.code}
            className={`standard-input h-[200px]`}
            placeholder={`Paste code here, separated by ","`}
            onChange={(e) => {
              setInput((prev)=>({...prev, code: e.target.value}));
            }}
          />
          </div>
         
            <button
              className={`primary-btn w-[100px] block ml-auto my-3`}
              disabled={!input.name || !input.points || !input.code || !input.description || loading}
              onClick={()=>{
                if(old) editHandle()
                else createHandle()
                }}
            >
              {old? `Save`:`Create`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherForm;
