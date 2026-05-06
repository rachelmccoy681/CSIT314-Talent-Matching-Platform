import React, { useState } from 'react'
import { supabase } from "./lib/client"

const App = () => {

	const [formData,setFormData] = useState({
			fullName:"",email:"",password:""
	})


	console.log(formData)

	function handleChange(event:React.ChangeEvent<HTMLInputElement>){
		setFormData((prevFormData)=>{
			return{
				...prevFormData,[event.target.name]:event.target.value
			}
		})
	}
	
  const handleSubmit = async () => {
    const { error } = await supabase.auth.signUp(
      {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        }
    );
    if (error) alert(error.message);
    else alert("Check your email for confirmation!");
  };

  // async function handleSubmit(){
  //   try {
  //     const { data, error } = await supabase.auth.signUp(
  //       {
  //         email: formData.email,
  //         password: formData.password,
  //         options: {
  //           data: {
  //             full_name: formData.fullName
  //           }
  //         }
  //       }
  //     )
  //     alert("Check your email for verification link")

  //   } catch(error) {
  //     alert(error)
  //   }    
    
  // }

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input
						placeholder="Fullname"
						name="fullName"
						onChange={handleChange}
				/>

				<input
				 placeholder="Email"
					name="email"
					onChange={handleChange}
				/>

				<input
					placeholder="Password"
					name="password"
          type="password"
					onChange={handleChange}
				/>

				<button type="submit">
					Submit
				</button>


				</form>
		</div>
	)
}

export default App
