import React from 'react';

const Register = () => {
    return (
        <div>
            {/* ? Preloader Start */}
            <div id="preloader-active">
                <div class="preloader d-flex align-items-center justify-content-center">
                    <div class="preloader-inner position-relative">
                        <div class="preloader-circle"></div>
                        <div class="preloader-img pere-text">
                            <img src="assets/img/logo/loder.png" alt=""/>
                        </div>
                    </div>
                </div>
            </div>
            {/* Preloader Start*/}


        {/* Register */}

        <main class="login-body" data-vide-bg="assets/img/login-bg.mp4">
            {/* Login Admin */}
            <form class="form-default" action="login-bg.mp4" method="POST">
                
                <div class="login-form">
                    {/* logo-login */}
                    <div class="logo-login">
                        <a href="index.html"><img src="assets/img/logo/loder.png" alt=""/></a>
                    </div>
                    <h2>Registration Here</h2>

                    <div class="form-input">
                        <label for="name">Full name</label>
                        <input  type="text" name="name" placeholder="Full name"/>
                    </div>
                    <div class="form-input">
                        <label for="name">Email Address</label>
                        <input type="email" name="email" placeholder="Email Address"/>
                    </div>
                    <div class="form-input">
                        <label for="name">Password</label>
                        <input type="password" name="password" placeholder="Password"/>
                    </div>
                    <div class="form-input">
                        <label for="name">Confirm Password</label>
                        <input type="password" name="password" placeholder="Confirm Password"/>
                    </div>
                    <div class="form-input pt-30">
                        <input type="submit" name="submit" value="Registration"/>
                    </div>
                    {/* Forget Password */}
                    <a href="login.html" class="registration">login</a>
                </div>
            </form>
            {/* /end login form */}
        </main>
            
        </div>
    );
}

export default Register;
