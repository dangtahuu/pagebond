const HeaderMenu=({list, menu, handler})=>{
    return(
        <ul className="flex items-center justify-start w-auto py-1 mb-3 gap-x-5">
          {list.map((v) => (
            <li
              key={v + "button"}
              className={`li-profile ${menu === v && "active"} `}
              onClick={() => {
                handler(v);
              }}
            >
              {v}
            </li>
          ))}
        </ul>
    )
}

export default HeaderMenu