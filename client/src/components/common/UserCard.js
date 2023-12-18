import { useNavigate } from "react-router-dom";

const UserCard = ({person})=> {
    const navigate = useNavigate()

    return(
        <div
        className="flex flex-col gap-y-2 bg-dialogue rounded-lg items-center p-3 cursor-pointer"
        onClick={() => {
          navigate(`/profile/${person._id}`);
        }}
        key={person._id}
      >
        <img
          className="rounded-full w-[40%]"
          src={person.image?.url}
          alt=""
        />
        <div className="font-bold">{person.name}</div>
      </div>
    )
}

export default UserCard