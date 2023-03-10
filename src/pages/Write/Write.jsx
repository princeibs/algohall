import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid4 } from "uuid";
import "./Write.scss";
import { createBlogAction } from "../../utils/actions";

const Write = ({ address }) => {
  const [thumbnail, setThumbnail] = React.useState();
  const [blogTitle, setBlogTitle] = useState();
  const [blogContent, setBlogContent] = useState();
  const navigate = useNavigate();

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const create = async () => {
    const _uuid = uuid4();
    const _slug = `${slugify(blogTitle)}-${_uuid}`;
    const blogData = {
      slug: _slug,
      title: blogTitle,
      content: blogContent,
      thumbnail: thumbnail,
    };

    if (String(blogTitle).length > 126 || String(thumbnail).length > 126) {
      alert("Title or thumbnail URL should be less than 126 characters")
      return;
    }

    if (String(blogContent).length > 1000) {
      alert("Content should be less than 1000 words");
      return;
    }

    await createBlogAction(address, blogData)
      .then(() => {
        navigate("/");
        alert("Successfully created new blog");
      })
      .catch(e => console.log("Error creating blog: " + e));
  };

  return (
    <>
      <div className="app__write">
        <div className="write">
          <div className="write-header">
            <img src={thumbnail} alt="thumbnail image" />
            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="Enter thumbnail URL here (Less than 126 characters)"
            />
          </div>
          <div className="write-edit">
            <input
              className="write-title"
              placeholder="Title here (Less than 126 characters)"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
            />
            <textarea
              className="write-content"
              placeholder="Write any update about the Algorand blockchain. It can be about Pyteal, Reach, algosdk, etc. (Should be less than 1000 characters)"
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
            />
          </div>
          <button className="publish-btn" onClick={() => create()}>
            Post Update
          </button>
        </div>
      </div>
    </>
  );
};

export default Write;
