import HomeNav from "./HomeNav";
import HomeMain from "./HomeMain";
import './styles/Home.css';

const Home = () => {

    return (
        <div className="page-container">
            <HomeNav />
            <HomeMain />
        </div>
    )
};

export default Home;