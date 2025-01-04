import React, { useState, useRef, useEffect } from 'react';

const MemeGenerator = () => {
    const [image, setImage] = useState(null);
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [fontSize, setFontSize] = useState(30);
    const [fontColor, setFontColor] = useState('#ffffff');
    const [filename, setFilename] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("filters");
    const [filterSettings, setFilterSettings] = useState({
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        blur: 0,
    });

    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result)
                setIsLoading(false)
            };
            reader.readAsDataURL(file);
        }
    };

    const setCanvasDimensions = (canvas, img) => {
        canvas.width = img.width > 500 ? 500 : img.width;
        canvas.height = img.height > 500 ? 500 : img.height;
    };

    const applyFiltersAndDrawImage = (canvas, ctx, img, saveChanges = false) => {
        const { brightness, contrast, grayscale, blur } = filterSettings;
        ctx.filter = `brightness(${filterSettings.brightness}%) contrast(${filterSettings.contrast}%) grayscale(${filterSettings.grayscale}%) blur(${filterSettings.blur}px)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (saveChanges) {
            const updatedImage = canvas.toDataURL()
            setImage(updatedImage)
        }
    };

    const drawMemeText = (canvas) => {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            setCanvasDimensions(canvas, img);
            applyFiltersAndDrawImage(canvas, ctx, img)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px Impact`;
            ctx.fillStyle = fontColor;
            ctx.textAlign = 'center';
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';

            if (topText) {
                const topTextY = Math.max(fontSize * 1.2, fontSize);
                ctx.strokeText(topText, canvas.width / 2, topTextY);
                ctx.fillText(topText, canvas.width / 2, topTextY);
            }
            if (bottomText) {
                const bottomTextY = canvas.height - Math.max(fontSize / 2, 10);
                ctx.strokeText(bottomText, canvas.width / 2, bottomTextY);
                ctx.fillText(bottomText, canvas.width / 2, bottomTextY);
            }
        };
        img.src = image;
    };
    const handleApplyFilters = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            applyFiltersAndDrawImage(canvas, ctx, img, true); // Save changes permanently
        };
        img.src = image;
    };

    const handlePreview = () => {
        if (image) {
            setIsPreviewOpen(true);
        }
    };
    useEffect(() => {
        if (isPreviewOpen && image) {
            const canvas = previewCanvasRef.current;
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                setCanvasDimensions(canvas, img); // Adjust canvas dimensions
                applyFiltersAndDrawImage(canvas, ctx, img);
                drawMemeText(canvas); // Add top and bottom text
            };
            img.src = image; // Trigger image load
        }
    }, [isPreviewOpen, image, filterSettings, topText, bottomText, fontSize, fontColor]);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen)
    }

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = filename ? `${filename}.png` : `meme${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterSettings((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                setCanvasDimensions(canvas, img);
                // Apply filters before drawing the image
                applyFiltersAndDrawImage(canvas, ctx, img);
                // Draw meme text
                drawMemeText(canvas);
            };
            img.src = image;
        }
    }, [image, filterSettings, topText, bottomText, fontSize, fontColor]);

    const shareOnSocialMedia = (platform) => {
        const canvas = canvasRef.current
        const dataUrl = canvas.toDataURL("image/png")

        const url = `https://${platform}.com/intent/tweet?text=Check out my meme!&url=${dataUrl}`
        window.open(url, "_blank")

    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-r from-blue-300 via-pink-200 to-yellow-200 m-8 rounded-lg">
                <nav className="bg-gradient-to-r from-purple-800 to-blue-700 text-white py-4 px-8 flex justify-between items-center shadow-lg">
                    <a href="#" className="text-xl font-bold p-2 hover:text-yellow-300">
                        Home
                    </a>
                    <a
                        href="https://imgflip.com/memetemplates?page=2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg p-2 hover:text-yellow-300 hover:underline font-semibold"
                    >
                        Browse Templates
                    </a>
                </nav>
                <div className="max-w-4xl mx-auto mt-10 bg-emerald-200 p-8 rounded-lg shadow-lg">
                    <h1 className="text-5xl font-extrabold text-center mb-10 text-purple-800">
                        Major Meme Studio
                    </h1>
                    {isLoading && (
                        <div className='flex justify-center mb-4'>
                            <div className='loader w-16 h-16 border-4 border-t-4 border-gray-400 rounded-full animate-spin'> </div>
                        </div>
                    )}
                    <div className="flex flex-wrap justify-center items-center space-x-4 mb-6">
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        <input className='p-2 rounded-md border border-gray-400' type="text" placeholder="Top Text" value={topText} onChange={(e) => setTopText(e.target.value)} />
                        <input className='p-2 rounded-md border border-gray-400' type="text" placeholder="Bottom Text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
                        <label className='flex items-center space-x-2'>
                            <span>Font Size:</span>
                            <input className='p-1 rounded-md border border-gray-400' type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                        </label>
                        <label className='p-1 rounded-lg border border-gray-500 text-md'>
                            <span>Font Color:</span>
                            <input className='p-1 rounded-md border border-gray-500' type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                        </label>
                        <input className='p-2 rounded-md border border-gray-400' type="text" placeholder="Filename" value={filename} onChange={(e) => setFilename(e.target.value)} />
                    </div>

                    <div className="flex justify-between border-b mb-4">
                        <button
                            className={`p-2 ${activeTab === 'filters' ? 'bg-gray-300' : ''}`}
                            onClick={() => setActiveTab('filters')}
                        >
                            Filters
                        </button>
                    </div>
                    {activeTab === 'filters' && (
                        <div className="flex justify-around">
                            <label>
                                Brightness:
                                <input
                                    type="range"
                                    name="brightness"
                                    min="0"
                                    max="200"
                                    value={filterSettings.brightness}
                                    onChange={handleFilterChange}
                                />
                            </label>
                            <label>
                                Contrast:
                                <input
                                    type="range"
                                    name="contrast"
                                    min="0"
                                    max="200"
                                    value={filterSettings.contrast}
                                    onChange={handleFilterChange}
                                />
                            </label>
                            <label>
                                Grayscale:
                                <input
                                    type="range"
                                    name="grayscale"
                                    min="0"
                                    max="100"
                                    value={filterSettings.grayscale}
                                    onChange={handleFilterChange}
                                />
                            </label>
                            <label>
                                Blur:
                                <input
                                    type="range"
                                    name="blur"
                                    min="0"
                                    max="10"
                                    value={filterSettings.blur}
                                    onChange={handleFilterChange}
                                />
                            </label>
                            <button
                                id='filterbtn'
                                onClick={handleApplyFilters}
                                className="p-2 bg-yellow-500 text-white rounded-xl mb-4  w-[350px] hover:bg-yellow-300 hover:text-red-500"
                            >
                                Apply Filters Permanently
                            </button>
                        </div>
                    )}



                    <canvas ref={canvasRef} className="block mx-auto mb-4 border-2 border-dashed border-gray-600 bg-white rounded-md shadow-lg w-full h-auto"></canvas>

                    <div className="text-center">
                        {image && (
                            <button
                                id="btn"
                                className="mr-4 px-5 py-3 rounded-lg bg-blue-500 text-white hover:scale-105"
                                onClick={handlePreview}
                            >
                                Preview Meme
                            </button>
                        )}
                        <button id='btn' onClick={handleDownload} className="mr-4 p-2 rounded-lg bg-green-500 text-white">Download Meme</button>
                    </div>
                    <div className='flex justify-center gap-4 mt-6'>
                        <button onClick={() => shareOnSocialMedia("twitter")} className=' flex items-center gap-2 px-4 py-2  bg-blue-500 text-white  m-5 rounded-full shadow-md hover:bg-blue-600 hover:shadow-lg'>
                            <i className='fab fa-twitter'></i>Share on Twitter
                        </button>
                        <button onClick={() => shareOnSocialMedia("Whatsapp")} className='flex items-center gap-2 px-4 py-2  bg-green-500 text-white  m-5 rounded-full shadow-md hover:bg-green-600 hover:shadow-lg'>
                            <i className='fab fa-whatsapp'></i> Share on Whatsapp
                        </button>
                        <button onClick={() => shareOnSocialMedia("Instagram")} className='flex items-center gap-2 px-4 py-2  bg-pink-500 text-white  m-5 rounded-full shadow-md hover:bg-pink-600 hover:shadow-lg'>
                            <i className='fab fa-instagram'></i> Share on Instagram
                        </button>
                    </div>
                </div>
                {isPreviewOpen && (
                    <div
                        className={`fixed inset-0 flex items-center justify-center ${isFullScreen ? 'bg-black' : 'bg-opacity-50'
                            }`}
                    >
                        <div className="bg-white p-6 rounded-lg shadow-xl">
                            <h2 className="text-lg font-bold mb-4">Meme Preview</h2>
                            <canvas
                                ref={previewCanvasRef}
                                className="transform transition-transform duration-500 hover:scale-110"
                            ></canvas>
                            <button
                                onClick={toggleFullScreen}
                                className="p-2 bg-gray-500 text-white rounded-lg mt-4"
                            >
                                {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                            </button>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 bg-red-500 text-white rounded-lg mt-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                )}
            </div>
        </>
    );
};

export default MemeGenerator;