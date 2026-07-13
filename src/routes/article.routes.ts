import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { CommentController } from "../controllers/comment.controller";

const articleRouter = Router();

articleRouter.get("/", ArticleController.getArticles);
articleRouter.post("/", ArticleController.createArticle);
articleRouter.get("/:id", ArticleController.getArticleById);
articleRouter.put("/:id", ArticleController.updateArticle);
articleRouter.delete("/:id", ArticleController.deleteArticle);

// Nested comment routes under each article ID
articleRouter.get("/:id/comments", CommentController.getComments);
articleRouter.post("/:id/comments", CommentController.createComment);

export default articleRouter;
