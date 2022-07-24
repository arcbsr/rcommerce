class Features {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                //$regex: this.query.name, 
                $regex: this.queryStr.keyword,
                // $regex: '.*' + this.queryStr.keyword + '.*',
                $options: "i"
            }
        }
            : {

            }
        if (this.queryStr.queryStr) {
            const myArray = this.queryStr.queryStr.split(" ");
            if (myArray.length > 0) {
                var regex = new RegExp(myArray[0], 'i');

            }
            if (myArray.length > 1) {
                var regex2 = new RegExp(myArray[1], 'i');
            }
            if (myArray.length > 1) {
                this.query = this.query.find({
                    $or: [{ name: regex }, { description: regex }, { tags: regex }, { "config.name": regex },
                    { name: regex2 }, { description: regex2 }, { tags: regex2 }, { "config.name": regex2 }]
                });
            } else {
                this.query = this.query.find({
                    $or: [{ name: regex }, { description: regex }, { tags: regex }, { "config.name": regex }]
                });
            }
        }
        //this.query = this.query.find({ $or: [{ name: regex2 }, { description: regex2 }, { "config.name": regex2 }] });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        // Removing some field for category
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach((key) => delete queryCopy[key]);

        this.query = this.query.find(queryCopy);
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }

}

module.exports = Features;