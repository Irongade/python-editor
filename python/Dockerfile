FROM python:3.9

WORKDIR /api

COPY ./requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir -r /api/requirements.txt

COPY . /api

EXPOSE 8000

CMD [ "gunicorn", "lint:app", "-b", ":8000" ]