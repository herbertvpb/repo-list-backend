const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next) {
	const { method, url } = request;
	const logLabel = `[${method.toUpperCase()}] ${url}`;
	console.time(logLabel);
	next();
	console.timeEnd(logLabel);
};

function validateRepositoryId(request, response, next) {
	const { id } = request.params;

  if (!isUuid(id)) 
    return response.status(400).json({ 
      error: 'Invalid repository ID.' 
    });
  
	return next();
};

function validateCreateRepositoryPayload(request, response, next) {
  const body = request.body;

  if (!body.hasOwnProperty('title')) 
    return response.status(400).json({ error: 'Title is required.' });
  if (!body.hasOwnProperty('url')) 
    return response.status(400).json({ error: 'Url is required.' });
  if (!body.hasOwnProperty('techs')) 
    return response.status(400).json({ error: 'Techs is required.' });

  return next();
};

app.use(logRequest);
app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", validateCreateRepositoryPayload, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0)
    return response.status(400).json({
      error: 'Repository not found'
    });
  
  const repository = {
    ...repositories[repositoryIndex],
    title,
    url,
    techs,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0)
    return response.status(400).json({
      error: 'Repository not found'
    });

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0)
    return response.status(400).json({
      error: 'Repository not found'
    });
  
  const likes = repositories[repositoryIndex].likes + 1;

  const repository = {
    ...repositories[repositoryIndex],
    likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

module.exports = app;
