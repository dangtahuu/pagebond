// common component
import Modal from "./common/Modal";
import Nav from "./common/Nav";
import Post from "./common/Post";
import Comment from "./common/Comment";
import Dropdown from "./common/Dropdown";
import FormCreatePost from "./common/FormCreatePost";
import ItemsList from "./common/ItemsList";
import GroupAvatars from "./common/GroupAvatars";
import Table from "./common/table/Table";

// loading component
import LoadingPost from "./loading/Loading.Post";
import LoadingSuggestion from "./loading/Loading.Suggestion";
import LoadingForm from "./loading/Loading.Form";
import LoadingProfile from "./loading/Loading.Profile";
import LoadingIntro from "./loading/Loading.Intro";
import LoadingImage from "./loading/Loading.Image";
import LoadingCard from "./loading/Loading.Card";
import LoadingPostInformation from "./loading/Loading.PostInformation";
import LoadingMessenger from "./loading/Loading.Messenger";

// pages
import Message from "./messenger/messenger.pages";
import Dashboard from "./dashboard/DashBoard";
import Profile from "./profile/Profile.pages";
import Admin from "./admin/Admin.page";
import Browse from "./browse/Browse.page";

import PostDetail from "./post/PostDetail";
import BookDetail from "./book/BookDetail";

// import ModalReview from "./common/ModalReview";
// import ModalExchange from "./common/ModalExchange";
import ModalShelves from "./common/ModalShelves";
import ModalShelf from "./common/ModalShelf";
// function

export {
  Nav,
  Post,
  Modal,
  ModalShelves,
  ModalShelf,
  Comment,
  Dropdown,
  ItemsList,
  GroupAvatars,
  FormCreatePost,
  Table,
  LoadingPost,
  LoadingSuggestion,
  LoadingForm,
  LoadingProfile,
  LoadingIntro,
  LoadingImage,
  LoadingPostInformation,
  LoadingCard,
  LoadingMessenger,
  // page
  Message,
  Dashboard,
  Profile,
  Browse,
  Admin,
  PostDetail,
  BookDetail
};
