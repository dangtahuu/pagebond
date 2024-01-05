import { useState } from "react";
import SimpleForm from "../../common/SimpleForm";
import { useAppContext } from "../../../context/useContext";
import { toast } from "react-toastify";

const Challenge = ({ setChallenge, challenge }) => {
  const { autoFetch } = useAppContext();
  const [openModal, setOpenModal] = useState(false);
  const [number, setNumber] = useState("");

  const checkInput = (input) => {
    const number = parseInt(input);
    const result = Number.isInteger(number) && number > 0;
    if (!result) {
      toast.error("Please enter a valid number");
      return false;
    } else return true;
  };

  const createChallenge = async () => {
    if (number)
      try {
        const { data } = await autoFetch.put(`/api/auth/create-challenge/`, {
          number,
        });
        // console.log(data.user)
        setChallenge(data.challenge);
      } catch (error) {
        console.log(error);
      }
  };
  return (
    <div>
      {openModal && (
        <SimpleForm
          checkInput={checkInput}
          text={number}
          title="Set challenge"
          setOpenModal={setOpenModal}
          setText={setNumber}
          submitHandle={createChallenge}
          label="Number"
          placeholder="Give it any number"
          note={
            "Challenge yourself with a number of books you wish to finish this year. Once you set this, it cannot be changed!"
          }
        />
      )}

      <div className="flex items-center gap-x-5">
        <img src="/images/challenge.png" className="w-[100px] h-[100px]" />
        {challenge?.number > 0 ? (
          <div className="flex flex-col items-start justify-center gap-y-2">
            <div className="serif-display">
              Your Reading Challenge <br />
              2024
            </div>
            <div className="flex items-center gap-x-2 w-full">
              <div>{challenge.progress}</div>
              <div class="w-full bg-altDialogue rounded-full h-2.5">
                <div
                  class="bg-greenBtn h-2.5 rounded-full"
                  style={{
                    width:
                      parseFloat(
                        (challenge?.progress / challenge?.number) * 100
                      ) + "%",
                  }}
                ></div>
              </div>
              <div>{challenge.number}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center gap-y-2">
            <div className="serif-display">
              Join the 2024 <br />
              Reading Challenge
            </div>
            <button
              className="primary-btn w-[100px]"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenge;
