const cl = console.log;

const postContainer = document.getElementById('postContainer');
const loader = document.getElementById('loader');
const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const  contentControl = document.getElementById('content');
const userIdControl = document.getElementById('userId');
const addPostBtn = document.getElementById('addPostBtn');
const updatePostBtn = document.getElementById('updatePostBtn');

const baseURL = `https://fir-api-call-9c6a1-default-rtdb.firebaseio.com`;
const postURL = `${baseURL}/posts.json`;

const snackBar = (msg, icon) => {
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

const createCards = (arr) => {
    let result = '';
    arr.forEach(post => {
        result += `<div class="card mb-3" id='${post.id}'>
                    <div class="card-header">
                        <h3>${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${post.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-info" onclick='onEditPost(this)'>Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick='onRemovePost(this)'>Remove</button>
                    </div>
                </div>`
    });
    postContainer.innerHTML = result;
}

const apiCall = (url, methodName, msgBody) => {
    msgBody = msgBody ? JSON.stringify(msgBody) : null;

    loader.classList.remove('d-none');

    return fetch(url, {
        method : methodName,
        body : msgBody,
        headers : {
            'Authorization' : 'Token from LS',
            'Content-Type' : 'Application/json'
        }
    })
    .then(res => res.json())
    .catch(err => snackBar('something went wrong!', 'erro'))
    .finally(() => {
        loader.classList.add('d-none')
    })
}

const onEditPost = (ele) => {
    window.scrollTo({
        top : 0,
        behavior : 'smooth'
    })
    let editId = ele.closest('.card').id;
    cl(editId);
    localStorage.setItem('editId', editId);

    let editURL = `${baseURL}/posts/${editId}.json`;

    apiCall(editURL, 'GET')
    .then(data => {
        cl(data);
        titleControl.value = data.title;
        contentControl.value = data.content;
        userIdControl.value = data.userId;

        addPostBtn.classList.add('d-none');
        updatePostBtn.classList.remove('d-none');
    })
}

const onRemovePost = (ele) => {
    let getConfirm = confirm('Are you sure to remove this Post');
    if(getConfirm){
        let removeId = ele.closest('.card').id;
        let removeURL = `${baseURL}/posts/${removeId}.json`;

        apiCall(removeURL, 'DELETE')
        .then(data => {
        ele.closest('.card').remove();
        snackBar(`Post with id ${removeId} removed successfully`);
   })
    }
}

apiCall(postURL, 'GET')
.then(data => {
    cl(data);
    let postArr = [];
    for (const key in data) {
        data[key].id = key;
        postArr.unshift(data[key]);
    }
    createCards(postArr)
})

const onAddPost = (eve) => {
    eve.preventDefault();
    let postObj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    cl(postObj);
    eve.target.reset();

    apiCall(postURL, 'POST', postObj)
    .then(data => {
        cl(data);
        let card = document.createElement('div');
        card.className = 'card mb-3';
        card.id = data.name;
        card.innerHTML = ` <div class="card-header">
                        <h3>${postObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${postObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-info" onclick='onEditPost(this)'>Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick='onRemovePost(this)'>Remove</button>
                    </div>`;
        postContainer.prepend(card);

        snackBar(`New post created successfully!!`, 'success');
    })
}

const onUpdatePost = () => {
    let updateId = localStorage.getItem('editId');
    let updateObj = {
         title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    postForm.reset();

    let updateURL = `${baseURL}/posts/${updateId}.json`;

    apiCall(updateURL, 'PATCH', updateObj)
    .then(data => {
        addPostBtn.classList.remove('d-none');
        updatePostBtn.classList.add('d-none');

        let card = document.getElementById(updateId);
        card.querySelector('h3').innerHTML = updateObj.title;
        card.querySelector('p').innerHTML = updateObj.content;

        snackBar(`Post with id ${updateId} updated successfully!!`, 'success');

        card.scrollIntoView({
            behavior : 'smooth'
        })
    })
}

postForm.addEventListener('submit', onAddPost);
updatePostBtn.addEventListener('click', onUpdatePost);