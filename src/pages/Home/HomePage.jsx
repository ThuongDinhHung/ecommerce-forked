import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import ProductList from '../../components/product/ProductList';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState({
        recommend: 'horizontal',
        recent: 'horizontal'
    });

    const comments = [
        {
            rating: 4.5,
            name: "Samantha D.",
            verified: true,
            comment: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
            date: "August 14, 2023"
        },
        {
            rating: 4,
            name: "Alex M.",
            verified: true,
            comment: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
            date: "August 15, 2023"
        },
        {
            rating: 3.5,
            name: "Ethan R.",
            verified: true,
            comment: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
            date: "August 16, 2023"
        },
        {
            rating: 4,
            name: "Olivia P.",
            verified: true,
            comment: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
            date: "August 17, 2023"
        },
        {
            rating: 4,
            name: "Liam K.",
            verified: true,
            comment: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
            date: "August 18, 2023"
        },
        {
            rating: 4.5,
            name: "Ava H.",
            verified: true,
            comment: "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
            date: "August 19, 2023"
        }
    ];

    const [productList, setProductList] = useState([]);
    // Get search params from URL
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('api/products/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('PRODUCT DATA LIST:', data);
                    setProductList(data.data.products);
                } else {
                    console.error('Failed to fetch products. Status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }

        fetchProducts();
    }, []);

    const filteredProducts = productList.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const changeMode = (viewName) => {
        setViewMode(prev => ({
            ...prev,
            [viewName]: prev[viewName] === 'horizontal' ? 'vertical' : 'horizontal'
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header showNav={true}/>
            
            <main className="max-w-6xl mx-auto p-6">

                {/* Newest Products Section */}
                <section className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">Suggested Products</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {filteredProducts.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No available products found.</p>
                        ) : 
                            <ProductList View={viewMode.recommend} Products={filteredProducts} modeRate={false}/>
                        }
                    </div>
                    <div className="flex justify-center mt-6">
                        <button className="px-8 py-2 font-medium text-sm md:text-base text-black bg-white 
                                rounded-full border-2 border-gray-300 shadow-sm
                                hover:scale-105 transition-transform duration-300 ease-in-out"
                                onClick={() => changeMode('recommend')}>
                            {viewMode.recommend === 'horizontal' ? 'View All' : 'View Less'}
                        </button>
                    </div>
                </section>

                {/* Top-Selling Products Section */}
                <section className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">Top-Selling Product</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {filteredProducts.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No available products found.</p>
                        ) : 
                            <ProductList View={viewMode.recent} Products={filteredProducts} modeRate={false}/>
                        }
                    </div>
                    <div className="flex justify-center mt-6">
                        <button className="px-8 py-2 font-medium text-sm md:text-base text-black bg-white 
                                rounded-full border-2 border-gray-300 shadow-sm
                                hover:scale-105 transition-transform duration-300 ease-in-out"
                                onClick={() => changeMode('recent')}>
                            {viewMode.recent === 'horizontal' ? 'View All' : 'View Less'}
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default HomePage;
