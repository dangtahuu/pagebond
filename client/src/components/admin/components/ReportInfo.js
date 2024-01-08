/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/useContext";
import ReactLoading from "react-loading";

const ReportInfo = ({ id, type, setOpenModal }) => {
  const { autoFetch, user } = useAppContext();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`api/log/logs/report/${id}/${type}`);
      console.log(data)
      setLogs(data.logs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[20000] top-0 left-0 ">
      <div
        className="z-[30000] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          setOpenModal(false);
        }}
      ></div>
      <div className="mx-auto w-[500px] max-h-[80%] overflow-auto style-3 bg-dialogue rounded-xl px-4 z-[40000] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
            Report
          </div>
          {loading ? (
            <div className="w-full flex justify-center">
              <ReactLoading
                type="spin"
                width={30}
                height={30}
                color="#7d838c"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-y-2 my-3">
              {logs.map((one) => (
                <div className="flex flex-col gap-y-2">
<div className="flex items-center justify-between">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${one?.fromUser?._id}`);
                    }}
                  >
                    <img
                      src={one?.fromUser?.image?.url}
                      className="rounded-full h-10 w-10 mr-2"
                    />
                    <div className="font-semibold">{one?.fromUser?.name}</div>
                  </div>

                  <button
                    className="ml-5 primary-btn bg-black"
                    onClick={() => {
                      navigate(`/profile/${one._id}`);
                    }}
                  >
                    Visit
                  </button>
                </div>
                <div className="p-2 rounded-md bg-altDialogue">
                    {one.note}
                </div>
                </div>
                
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportInfo;
