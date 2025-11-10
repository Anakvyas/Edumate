// "use client";

// import axios from 'axios';
// import React, { useState } from 'react';
// import { htmlToText } from 'html-to-text'
// import './page.css';
// import Upload from '../pdf_Assis/upload';

// export default function Home() {
//   const [Emails, setEmails] = useState<any[]>([]);
//   const [Events, setEvents] = useState<any[]>([]);
//   const [Summary, setSummary] = useState<string>('');

//   const handlelogin = () => {
//     window.location.href = '/api/auth/callback';
//   }

//   const handleEmail = async () => {
//     try {
//       const res = await axios.get('/api/emails')
//       console.log(res.data.value);
//       setEmails(res.data);
//       console.log(Emails)

//     } catch (err) {
//       console.error('Error handling email:', err);
//       alert('Failed to fetch emails. Please try again later.');
//     }

//   }

//   const handleCalneder = async () => {
//     try {
//       const res = await axios.get('/api/calender')
//       setEvents(res.data)
//       console.log(Events);

//     } catch (err) {
//       console.error('Error handling events:', err);
//       alert('Failed to fetch events. Please try again later.');
//     }
//   }

//   const summarize = async (text: string) => {
//     try {
//       const summary = htmlToText(text, {
//         wordwrap: 130,
//       });

//       const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + '/summarize', { transcript: summary });
//       if (res.data.summary === undefined) {
//         console.error('No summary returned from server');
//         return;
//       }

//       setSummary(res.data.summary);
//       console.log('Summary:', Summary);

//     } catch (err) {
//       console.error('Error summarizing text:', err);
//       alert('Failed to summarize text. Please try again later.');
//     }
//   }

//   return (
//     <div>
    
//       <br></br>

//       <button className='bg-blue-500 text-white rounded-lg p-2 m-5 cursor-pointer' onClick={handlelogin}>LOGIN with outlook Account</button>

//       <button className='bg-red-500 text-white rounded-lg p-2 m-5 cursor-pointer' onClick={handleEmail}>ALL EMAILS</button>

//       <button className='bg-pink-500 text-white rounded-lg p-2 m-5 cursor-pointer' onClick={handleCalneder}>calender</button>

//       {Emails.length > 0 && (
//         <div className='mt-5'>
//           <h2 className='text-xl font-bold'>Emails:</h2>
//           <ul>
//             {Emails.map((email, index) => (
//               <li key={index} className='border p-2 my-2'>
//                 <button className='bg-orange-500 text-black rouned-lg p-2 m-5 cursor-pointer rounded-lg' onClick={() => summarize(email.body.content)}>Summary</button>
//                 {/* <button className='bg-orange-500 text-black rouned-lg p-2 m-5 cursor-pointer rounded-lg' onClick={() => summarize(email.body.content)}>Summary</button>
//                 <button className='bg-orange-500 text-black rouned-lg p-2 m-5 cursor-pointer rounded-lg' onClick={() => summarize(email.body.content)}>Summary</button> */}

//                 <p><strong>Subject:</strong> {email.subject}</p>
//                 <p><strong>From:</strong> {email.fromName} ({email.fromAddress})</p>
//                 <p><strong>Received:</strong> {new Date(email.receivedDateTime).toLocaleString()}</p>
//                <div><strong>Body:</strong><div className="email-body" dangerouslySetInnerHTML={{ __html: email.body.content }}/></div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <Upload/>

//     </div>
//   );
// }
