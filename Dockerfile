FROM node:14

ADD entrypoint.sh /entrypoint.sh
ADD exclude_unwanted_files.js /exclude_unwanted_files.js
RUN chmod +x entrypoint.sh
ADD logic.js /logic.js
ENTRYPOINT ["/entrypoint.sh"]
