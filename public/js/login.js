import axios from 'axios';

export const login = async (email, password) => {
    try{
        const res = await axios({
        method: 'POST',
        url: 'http://localhost:8000/api/v1/users/login',
        data: {
                email: email,
                password: password 
            } 
        });
        
        if(res.data.status === 'success'){
            alert('Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    } catch(err){
        alert(err);
    }
};