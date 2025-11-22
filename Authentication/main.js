    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');

    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
 
    const loginForm = document.getElementById('login')
    const signupForm = document.getElementById('signup')

//? Initializing users array in localStorage if it doesn't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

//? Toggle between login and signup forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
});


//? Signup form handler
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usernameInput = signupForm.querySelector('.username');
    const emailInput = signupForm.querySelector('.email');
    const passwordInput = signupForm.querySelector('.password');
    
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate inputs
    if (!username || !email || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in all fields!',
            confirmButtonColor: '#ff7e5f'
        });
        return;
    }

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users'));

    // Check if username already exists
    const userExists = users.some(user => user.username === username || user.email === email);
    
    if (userExists) {
        Swal.fire({
            icon: 'error',
            title: 'Already Exists',
            text: 'Username or email already exists!',
            confirmButtonColor: '#ff7e5f'
        });
        return;
    }

    //? Create new user object
    const newUser = {
        username: username,
        email: email,
        password: password
    };

    //? Add user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Sign up successful! Please log in.',
        confirmButtonColor: '#ff7e5f',
        timer: 2000
    }).then(() => {
        //? Clear form and switch to login
        signupForm.reset();
        showLogin.click();
    });
});


//? Login form handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = loginForm.querySelector('.usernamelogin');
    const passwordInput = loginForm.querySelector('.passwordlogin');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please enter both username and password.',
            confirmButtonColor: '#ff7e5f'
        });
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.username === username && u.password === password);
    console.log(user);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        loginForm.reset();
        window.location.href = '../Home/home.html';

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid username or password.',
            confirmButtonColor: '#ff7e5f'
        });
    }
});

