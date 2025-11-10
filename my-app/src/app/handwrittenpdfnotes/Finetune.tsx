import { Plus } from "lucide-react";
import React, { useRef, useState } from "react";

const Finetune = () => {
    const texts = [
        "The quick brown fox jumps over the lazy dog.",
        "HELLO FRIEND, HOPE YOU'RE HAVING A GREAT DAY!",
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789 and 9876543210",
        "I saw O0 and l1 look almost the same sometimes.",
        "My email is user.demo+test123@example.com",
        "Visit https://example.org for more information.",
        "The price was $12.99 or ₹1,250 depending on the shop.",
        "Today is 09/11/2025 and the time is 11:45 AM.",
        "My address is 221B Baker Street, London.",
        "Room 4B, Block C, Phase 2, Sector 11 is where I live.",
        "Keep calm & stay positive :)",
        "This sentence contains punctuation, commas, and dots.",
        "bdfhklt stand tall; gpqy drop below the line.",
        "Similar pairs: O0 oO 1lI iI 2Z z2 5S s5 8B b8.",
        "MixNumbersWithWordsLikeThis123 to test recognition.",
        "a^2 + b^2 = c^2 is the Pythagorean theorem.",
        "for(i = 0; i < 10; i++) { print(\"Hello\"); }",
        "Handwriting is personal; write the way you normally do."
    ];
    const [uploaded, setuploaded] = useState<{ [key: number]: File }>({});
    const uploadRefs = useRef<HTMLInputElement[]>([]);

    const handleClickUpload = (index: number) => {
        uploadRefs.current[index]?.click();
    };

    const handleuploades = (e: any, index: number) => {
        const file = e.target.files[0];
        if (!file) return;
        setuploaded((prev: any) => ({ ...prev, [index]: file }));
    }

    return (
        <div className="flex flex-col text-white justify-center items-center w-full m-auto p-5 gap-3 ">
            <h1 className="font4 text-3xl font-black">Fine Tune YOUR Model</h1>

            <p className="text-center mt-4 text-gray-300 w-[90%] md:w-[60%] font3">
                Upload one image for each text line. Make sure your writing matches the text.
            </p>

                
            <div className="flex flex-col w-[80vw] justify-center items-center  ">
                {texts.map((t, index) => (
                    <div key={index} className="w-full md:w-[60%] bg-gray-800 p-4 rounded-lg mb-4">

                        <p className="text-green-400 font-medium">TEXT:</p>
                        <p className="text-gray-300 mb-3">{t}</p>

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el: any) => (uploadRefs.current[index] = el!)}
                            onChange={(e) => { handleuploades(e, index) }}
                        />

                        <div
                            className="w-full h-[10vh] border border-purple-500 border-dashed rounded-md text-center flex flex-col justify-center items-center cursor-pointer hover:bg-purple-500/20 transition">
                            <div onClick={() => handleClickUpload(index)} className="p-2 flex flex-col justify-center w-full items-center ">
                                {uploaded[index] ? (
                                    <span className="text-green-400 font-medium">Image Uploaded Successfully!</span>
                                ) : (
                                    <>
                                        <Plus className="mb-1" />
                                        Click Here to Upload Image  </>
                                )}
                            </div>

                        </div>
                    </div>
                ))}

        

            </div>
        </div>
    );
};

export default Finetune;
