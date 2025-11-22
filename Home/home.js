let loggedInUser = localStorage.getItem("currentUser");
let user = loggedInUser ? JSON.parse(loggedInUser) : false;

//? Check if user is logged in, redirect to login if not
if (!user) {
  window.location.href = "../Authentication/index.html";
}

//? Update the live clock in the header

function updateClock() {
  const clockElement = document.getElementById("live-clock");
  if (clockElement) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    clockElement.textContent = timeString;
  }
}

setInterval(updateClock, 1000);

//? greet user
const greetUser = document.getElementById("user-greeting");
if (user && greetUser) {
  greetUser.innerText = `Hi, ${user.username}`;
}

// ?Initialize posts array in localStorage if it doesn't exist
if (!localStorage.getItem("posts")) {
  localStorage.setItem("posts", JSON.stringify([]));
}

//? Post creation  data
const postBtn = document.getElementById("postBtn");
const postInput = document.getElementById("postInput");
const imageInput = document.getElementById("imageInput");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.querySelector(".search-btn");

//? Search query state
let searchQuery = "";

//? Sort state
let currentSort = "latest"; // Default to latest

//? create post function
function createPost() {
  if (!user) {
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please log in to create a post.',
      confirmButtonColor: '#ff7e5f'
    });
    return;
  }

  const postText = postInput.value.trim();
  const imageUrl = imageInput.value.trim();

  if (!postText) {
    Swal.fire({
      icon: 'warning',
      title: 'Empty Post',
      text: 'Please enter some text for your post.',
      confirmButtonColor: '#ff7e5f'
    });
    return;
  }

  // Get existing posts from localStorage
  const posts = JSON.parse(localStorage.getItem("posts"));

  const newPost = {
    id: Date.now(), // Unique ID based on timestamp
    username: user.username,
    email: user.email,
    text: postText,
    imageUrl: imageUrl || null,
    likes: 0,
    liked: false, // Initialize liked property
    timestamp: new Date().toISOString(), // this format also help to creat new date
  };

  posts.unshift(newPost); // Add to beginning for latest first
  localStorage.setItem("posts", JSON.stringify(posts));

  postInput.value = "";
  imageInput.value = "";

  //* Render all posts
  renderPosts();
  updateSidebarStats();
}

//? render posts
function renderPosts() {
  if (!feed) return;

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");

  // Filter posts based on search query
  let filteredPosts = posts; //* initially all posts will be filtered post so that we can render all posts

  if (searchQuery.trim()) {
    //* if user types anything in the input then we filtered post based on input , either name or post text
    const query = searchQuery.toLowerCase().trim();
    filteredPosts = posts.filter((post) => {
      const postText = post.text.toLowerCase();
      const username = post.username.toLowerCase();
      return postText.includes(query) || username.includes(query);
    });
  }

  // Sort posts based on current sort option
  filteredPosts = sortPosts(filteredPosts, currentSort);

  console.log(filteredPosts  ,"posts")

  // console.log(filteredPosts , "filtered post")

  if (filteredPosts.length === 0) {
    //* if user does not have any post initally
    if (searchQuery.trim()) {
      feed.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #666;">No posts found matching your search.</p>';
    } else {
      feed.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #666;">No posts yet. Be the first to post!</p>';
    }
    return;
  }

  feed.innerHTML = filteredPosts.map((post) => {
      const avatar = post.username.charAt(0).toUpperCase();
      const timeAgo = getTimeAgo(new Date(post.timestamp));
      console.log(new Date(post.timestamp));

      return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-info">
                        <div class="avatar">${avatar}</div>
                        <div class="details">
                            <span class="username">${post.username}</span>
                            <span class="timestamp">${timeAgo}</span>
                        </div>
                    </div>
                    ${
                      post.username === user?.username
                        ? '<button class="delete-btn" onclick="deletePost(' +
                          post.id +
                          ')">🗑️</button>'
                        : ""
                    }
                </div>
                
                <p class="post-text">${post.text}</p>
                
                ${
                  post.imageUrl
                    ? `<div class="post-image" style="background-image: url('${post.imageUrl}');"></div>`
                    : ""
                }
                
                <div class="post-footer">
                    <button class="like-btn" onclick="likePost(${post.id})">
                        <span class="heart-icon">${
                          post.liked === true ? "❤️" : "🤍"
                        }</span> 
                        <span class="like-count">${post.likes || 0}</span>
                    </button>
                </div>
            </div>
        `;
    })
    .join("");
}



//? Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();

  const diffInSeconds = Math.floor((now - date) / 1000); // converting mili seconds into seconds

  console.log(diffInSeconds);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    // 1 hour = 3600 sec if seconds are less then one 1 hour then show minuntes
    const minutes = Math.floor(diffInSeconds / 60); // convert seconds into minutes
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    // 1 day (24 hours) = 86400 sec if seconds are less then one 1 day (24 hour) then show hours
    const hours = Math.floor(diffInSeconds / 3600); // convert seconds into  hours
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    // 1 week (7 days)  = 604800 sec   if seconds are less then one 7 day  then show days
    const days = Math.floor(diffInSeconds / 86400); // convert seconds into  days
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return date.toLocaleDateString(); // If older than a week, returns a formatted date string (e.g., "12/25/2023")
  }
}

//? Delete post function
function deletePost(postId) {
  Swal.fire({
    title: 'Delete Post?',
    text: "Are you sure you want to delete this post?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4444',
    cancelButtonColor: '#666',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]");
      const filteredPosts = posts.filter((post) => post.id != postId);
      localStorage.setItem("posts", JSON.stringify(filteredPosts));
    renderPosts();
    updateSidebarStats();
    
    Swal.fire({
        title: 'Deleted!',
        text: 'Your post has been deleted.',
        icon: 'success',
        confirmButtonColor: '#ff7e5f',
        timer: 1500
      });
    }
  });
}

//? Like post function
function likePost(postId) {
  // Convert postId to number since it comes as string from onclick
  postId = Number(postId);

  const posts = JSON.parse(localStorage.getItem("posts"));
  const post = posts.find((p) => p.id === postId);

  if (post) {

    // Toggle like status
    if (post.liked === false) {
      post.likes = (post.likes || 0) + 1;
      post.liked = true;
    } else {
      post.likes = Math.max(0, (post.likes || 0) - 1);
      post.liked = false;
    }

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
    updateSidebarStats();
  } else {
    console.error("Post not found with id:", postId);
  }
}


//*

//? Sort posts function
function sortPosts(posts, sortType) {
  const sortedPosts = [...posts]; // Create a copy to avoid mutating original array

  if (sortType == "latest"){
         // Sort by timestamp descending (newest first)
         return sortedPosts.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
  } else if(sortType == "oldest"){

    return sortedPosts.sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
  })

  } else{
     return sortedPosts;
  }
  
  
}

//? Handle sort change
function handleSortChange(sortType) {
  currentSort = sortType;
  
  // Update active state of filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    if (btn.getAttribute("data-sort") === sortType) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Re-render posts with new sort order
  renderPosts();
}


//*
//? Search functionality
function handleSearch() {
  searchQuery = searchInput.value;
  renderPosts();
  // Sidebar stats don't need to update on search, only when posts change
}

//? Search input event listeners,  Search as user types , or if user enters
if (searchInput) {
  searchInput.addEventListener("input", handleSearch);

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
}

//? Logout functionality
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "../Authentication/index.html";
}

//? Event listeners
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff7e5f',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  });
}

if (postBtn) {
  postBtn.addEventListener("click", createPost);
}

//? Filter button event listeners
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sortType = btn.getAttribute("data-sort");
    handleSortChange(sortType);
  });
});

//? Update sidebar stats
function updateSidebarStats() {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  
  //? Update user profile
  if (user) {
    const profileAvatarText = document.getElementById("profile-avatar-text");
    const profileUsername = document.getElementById("profile-username");
    const profileEmail = document.getElementById("profile-email");
    
    if (profileAvatarText) {
      profileAvatarText.textContent = user.username.charAt(0).toUpperCase();
    }
    if (profileUsername) {
      profileUsername.textContent = user.username;
    }
    if (profileEmail) {
      profileEmail.textContent = user.email;
    }
  }
  
  //? Calculate stats
  const userPosts = posts.filter((post) => post.username === user?.username);
  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
  
  //? Update stats
  const totalPostsEl = document.getElementById("total-posts");
  const totalLikesEl = document.getElementById("total-likes");
  
  if (totalPostsEl) {
    totalPostsEl.textContent = totalPosts;
  }
  if (totalLikesEl) {
    totalLikesEl.textContent = totalLikes;
  }
}

//? Render posts on page load
renderPosts();
updateSidebarStats();
