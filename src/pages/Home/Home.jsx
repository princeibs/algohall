import React, {useState, useEffect} from 'react'
import { Welcome } from "../";
import { Loading } from '../../components';
import { readingTime } from "reading-time-estimator";
import { Link } from "react-router-dom";
import coffeeImage from "../../assets/coffee_img.png";
import { getAllBlogsAction } from '../../utils/actions';
import { truncateAddress } from '../../utils/conversions';
import "./Home.scss"


const Home = ({connectWallet, address}) => {
    const [allBlogs, setAllBlogs] = useState(null)
    const [loading, setLoading] = useState(false)

    const getAllBlogs = async () => {
        setLoading(true);
        getAllBlogsAction()
            .then(blogs => {
                setAllBlogs(blogs)
                console.log(blogs)
            })
            .catch(e => {
                console.log(e)
                alert("Error getting blogs")
            })
            .finally(() => {
                setLoading(false)
            })
    } 

    useEffect(() => {
        getAllBlogs()
    }, [])

  return (
    <>
      {address ? (
        <>
          <div className="app__app">
            <h2 className="app-heading">Recently Published Blogs</h2>
            {!loading ? (
              <div className="app-body">
                {allBlogs?.map((blog) => (
                  <div className="preview">
                    <img src={blog.thumbnail} />
                    <div className="preview-meta-0">
                      <div className="preview-meta-1">
                        <div className="preview-dp">
                          {new Date(
                            blog.datePublished * 1000
                          ).toDateString()}
                        </div>
                        <div className="preview-rt">
                          {readingTime(blog.content).minutes} mins read
                        </div>
                      </div>
                      <div className="preview-author">
                        by <span>{truncateAddress(blog.author)}</span>
                      </div>
                    </div>
                    <div className="preview-title">
                      <Link to={`/blog/${blog.appId}`}>{blog.title}</Link>
                    </div>
                    <div className="preview-preview">{blog.content}</div>
                    <hr />
                    <div className="preview-lc">
                      <img src={coffeeImage} />
                      <div>{blog.coffeeCount}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Loading/>
            )}
          </div>
        </>
      ) : (
        <Welcome connect={connectWallet} />
      )}
    </>
  )
}

export default Home