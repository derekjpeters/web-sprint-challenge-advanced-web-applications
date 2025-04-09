import React, { useState } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Articles from "./Articles";
import LoginForm from "./LoginForm";
import Message from "./Message";
import ArticleForm from "./ArticleForm";
import Spinner from "./Spinner";
import axios from "axios";

const articlesUrl = "http://localhost:9000/api/articles";
const loginUrl = "http://localhost:9000/api/login";

export default function App() {
	const [message, setMessage] = useState("");
	const [articles, setArticles] = useState([]);
	const [currentArticleId, setCurrentArticleId] = useState();
	const [spinnerOn, setSpinnerOn] = useState(false);

	const navigate = useNavigate();

	const redirectToLogin = () => {
		navigate("/");
	};

	const redirectToArticles = () => {
		navigate("/articles");
	};

	const logout = () => {
		localStorage.removeItem("token");
		setMessage("Goodbye!");
		redirectToLogin();
	};

	const login = ({ username, password }) => {
		setMessage("");
		setSpinnerOn(true);

		axios
			.post(loginUrl, { username, password })
			.then((res) => {
				localStorage.setItem("token", res.data.token);
				setMessage(res.data.message);
				redirectToArticles();
			})
			.catch((err) => {
				console.error(err);
				setMessage(err.response?.data?.message || "Login failed.");
			})
			.finally(() => setSpinnerOn(false));
	};

	const getArticles = () => {
		setMessage("");
		setSpinnerOn(true);

		const token = localStorage.getItem("token");

		axios
			.get(articlesUrl, {
				headers: {
					Authorization: token,
				},
			})
			.then((res) => {
				setArticles(res.data.articles);
				setMessage(res.data.message);
			})
			.catch((err) => {
				console.error(err);
				if (err.response?.status === 401) {
					redirectToLogin();
				} else {
					setMessage("Failed to fetch articles.");
				}
			})
			.finally(() => setSpinnerOn(false));
	};

	const postArticle = (article) => {
		setMessage("");
		setSpinnerOn(true);

		const token = localStorage.getItem("token");

		axios
			.post(articlesUrl, article, {
				headers: {
					Authorization: token,
				},
			})
			.then((res) => {
				setArticles([...articles, res.data.article]);
				setMessage(res.data.message);
			})
			.catch((err) => {
				console.error(err);
				setMessage("Failed to post article.");
			})
			.finally(() => setSpinnerOn(false));
	};

	const updateArticle = ({ article_id, article }) => {
		setMessage("");
		setSpinnerOn(true);

		const token = localStorage.getItem("token");

		axios
			.put(`${articlesUrl}/${article_id}`, article, {
				headers: {
					Authorization: token,
				},
			})
			.then((res) => {
				setArticles(
					articles.map((a) =>
						a.article_id === article_id ? res.data.article : a
					)
				);
				setMessage(res.data.message);
				setCurrentArticleId(null);
			})
			.catch((err) => {
				console.error(err);
				setMessage("Failed to update article.");
			})
			.finally(() => setSpinnerOn(false));
	};

	const deleteArticle = (article_id) => {
		setMessage("");
		setSpinnerOn(true);

		const token = localStorage.getItem("token");

		axios
			.delete(`${articlesUrl}/${article_id}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((res) => {
				setArticles(articles.filter((a) => a.article_id !== article_id));
				setMessage(res.data.message);
			})
			.catch((err) => {
				console.error(err);
				setMessage("Failed to delete article.");
			})
			.finally(() => setSpinnerOn(false));
	};

	return (
		<>
			<Spinner on={spinnerOn} />
			<Message message={message} />
			<button id="logout" onClick={logout}>
				Logout from app
			</button>
			<div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
				<h1>Advanced Web Applications</h1>
				<nav>
					<NavLink id="loginScreen" to="/">
						Login
					</NavLink>
					<NavLink id="articlesScreen" to="/articles">
						Articles
					</NavLink>
				</nav>
				<Routes>
					<Route path="/" element={<LoginForm login={login} />} />
					<Route
						path="articles"
						element={
							<>
								<ArticleForm
									postArticle={postArticle}
									updateArticle={updateArticle}
									currentArticle={articles.find(
										(a) => a.article_id === currentArticleId
									)}
									setCurrentArticleId={setCurrentArticleId}
								/>
								<Articles
									articles={articles}
									getArticles={getArticles}
									setCurrentArticleId={setCurrentArticleId}
									deleteArticle={deleteArticle}
								/>
							</>
						}
					/>
				</Routes>
				<footer>Bloom Institute of Technology 2024</footer>
			</div>
		</>
	);
}
