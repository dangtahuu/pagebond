import { toast } from "react-toastify";

const checkInput = (type, input)=>{
    console.log(input)
    if (!input.text) {
        toast.error("Text is missing");
        return false
    }
    if (type==="review") {
        if(!input.rating || !input.content || !input.development || !input.writing || !input.development) {
            toast.error("Please fill all the stars in all the fields");
            return false
        }
        if(!input.pacing) {
            toast.error("Please choose pacing");
            return false
        }
    }

    if (type==="trade") {
        if(!input.address) {
            toast.error("Please enter an address");
            return false
        }
        if(!input.condition) {
            toast.error("Please choose condition");
            return false
        }
    }

    if (type==="news") {
        if(!input.title) {
            toast.error("Please enter a title");
            return false
        }
      
    }

    return true;

}

export default checkInput