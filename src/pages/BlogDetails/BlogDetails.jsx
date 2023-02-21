import React, { useState, useEffect, useCallback } from "react";
import coffeeImage from "../../assets/coffee_img.png";
import { useParams } from "react-router";
import { truncateAddress } from "../../utils/conversions";
import "./BlogDetails.scss";
import { getBlog } from "../../utils/actions";
import { readingTime } from "reading-time-estimator";

const BlogDetails = () => {
  const [coffeeQty, setCoffeeQty] = useState(1);
  const [blog, setBlog] = useState();
  const { appId } = useParams();

  const tip = async () => {
    try {
   
    console.log("Tipped author "+coffeeQty+" Coffee")
    } catch (e) {
      console.log({ e });
    }
  };

  const blogDetails = useCallback(async () => {
    try {
      setBlog(await getBlog(appId));
    } catch (e) {
      console.log({ e });
    }
  });

  useEffect(() => {
    blogDetails();
  }, []);

  return (
    <>
      {blog ? (
        <div className="app__details">
          <div className="details">
            <img src={blog.thumbnail} />
            <div className="details-meta-0">
              <div className="details-meta-1">
                <div className="details-dp">
                  {new Date(blog.datePublished * 1000).toLocaleString()}
                </div>
                <div className="details-rt">
                  {readingTime(blog.content).minutes} mins read
                </div>
              </div>
              <div className="details-author">
                by <span>{truncateAddress(blog.author)}</span>
              </div>
            </div>
            <div className="details-title">{blog.title}</div>
            <div className="details-details">{blog.content}</div>
            <hr />
            <div className="details-lc">
              <div className="details-lc-1">
                <img src={coffeeImage} />
                <div>{blog.coffeeCount}</div>
              </div>
              <div className="details-lc-2">
                <span onClick={() => tip()}>Buy author {coffeeQty} coffee</span>
                <input
                  defaultValue={1}
                  min={1}
                  value={coffeeQty}
                  onChange={(e) => setCoffeeQty(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default BlogDetails;
