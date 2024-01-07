import { VscOpenPreview } from "react-icons/vsc";

const InformationBook = ({ book }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold serif-display text-white">
          {book.title}
        </h1>
        <a
          href={`${book?.previewLink}&lpg=PP1&pg=PP1&output=embed`}
          target="_blank"
          rel="noreferrer"
        >
            <VscOpenPreview className="text-2xl text-white" />
        </a>
        {/* <div className="relative" ref={exceptRef}>
          <AiOutlineMessage
            className={`text-2xl ${
              !promptLoading ? `cursor-pointer` : `opacity-30`
            } `}
            onClick={() => {
              setPromptOpen((prev) => !prev);
            }}
          />
          {promptOpen && (
            <div
              ref={promptRef}
              className={`flex flex-col items-center py-4 bg-navBar justify-center rounded-lg absolute w-[450px] right-0 top-[40px] mb-5 gap-y-2
                  `}
            >
              {promptList.map((one) => (
                <div
                  className="w-[400px] text-sm py-2 px-4 rounded-lg border-[1px] border-dialogue cursor-pointer"
                  onClick={() => {
                    chatInfo = { ...chatInfo, text: one };
                    navigate(
                      `/chat/?data=${encodeURIComponent(
                        JSON.stringify(chatInfo)
                      )}`
                    );
                    // setPageState("text", one)
                  }}
                >
                  <div>{one}</div>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{book.author}</h2>

        {/* <div>
          {promptLoading && (
            <ReactLoading type="bubbles" width={20} height={20} color="white" />
          )}
        </div> */}
      </div>

      <div className="text-base mt-3 text-justify">{book.description}</div>
      {/* <p className="text-lg">{book.description}</p> */}
      <div className="text-sm  text-smallText mt-3">
        <div>{book.pageCount}</div>
        <div>
          {book.publishedDate} by {book.publisher}
        </div>
      </div>
    </div>
  );
};

export default InformationBook;
