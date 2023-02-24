from pyteal import *
from util import convert_uint_to_bytes

class Blog:
    class Variables:
        slug = Bytes("SLUG")
        title = Bytes("TITLE")
        content = Bytes("CONTENT")
        thumbnail = Bytes("THUMBNAIL")
        author = Bytes("AUTHOR")
        datePublished = Bytes("DATEPUBLISHED")
        coffeeCount = Bytes("COFFEECOUNT")

    class AppMethods:
        buyCoffee = Bytes("buyCoffee")

    # stores the description of the memory in the global state
    @Subroutine(TealType.none)
    def store_content(content: Expr):
        counter = ScratchVar(TealType.uint64)
        length_of_bytes = ScratchVar(TealType.uint64)
        length_of_bytes_to_store = ScratchVar(TealType.uint64)
        starting_index = ScratchVar(TealType.uint64)
        current_bytes = ScratchVar(TealType.bytes)
        key_index = ScratchVar(TealType.bytes)
        return Seq([
            length_of_bytes.store(Len(content)),

            # iterate through indexes from 0 - 7
            For(
                counter.store(Int(0)), counter.load() < Int(
                    8), counter.store(counter.load() + Int(1))
            ).Do(

                # convert index to string
                key_index.store(convert_uint_to_bytes(counter.load())),

                # store starting index
                starting_index.store(Int(127) * counter.load()),

                # if length of bytes is equal to zero
                If(length_of_bytes.load() == Int(0))
                .Then(
                    # break out of loop
                    Break()
                )
                # else if remaining length of blog data bytes is greater than 127.
                .ElseIf(length_of_bytes.load() > Int(127))
                .Then(
                    Seq([
                        # reduce bytes length by 125
                        length_of_bytes.store(
                            length_of_bytes.load() - Int(127)),

                        # store the length of bytes to store
                        length_of_bytes_to_store.store(Int(127)),
                    ])
                ) .Else(
                    # store the length of bytes left to store
                    length_of_bytes_to_store.store(length_of_bytes.load()),

                    # update length_of_bytes
                    length_of_bytes.store(
                        length_of_bytes.load() - length_of_bytes_to_store.load())
                ),

                # Extract bytes from blog_data
                current_bytes.store(
                    Extract(content, starting_index.load(), length_of_bytes_to_store.load())),

                # Store bytes in global state
                App.globalPut(key_index.load(), current_bytes.load())
            )
        ])

    def application_creation(self): 
        return Seq([
            Assert(Txn.application_args.length() == Int(4)),
            Assert(Txn.note() == Bytes("algohall:ui1")),  
            self.store_content(Txn.application_args[2]),          
            App.globalPut(self.Variables.slug, Txn.application_args[0]),
            App.globalPut(self.Variables.title, Txn.application_args[1]),
            App.globalPut(self.Variables.thumbnail, Txn.application_args[3]),
            App.globalPut(self.Variables.author, Txn.sender()),
            App.globalPut(self.Variables.datePublished, Global.latest_timestamp()),
            App.globalPut(self.Variables.coffeeCount, Int(0)),
            Approve()
        ])

    def buyCoffee(self):
        coffee = Txn.application_args[1]
        Assert(
            And(
                App.globalGet(self.Variables.author) != Txn.sender(),
                Global.group_size() == Int(2),
                Gtxn[1].type_enum() == TxnType.Payment,
                Gtxn[1].receiver() == App.globalGet(self.Variables.author),
            )
        )

        return Seq([
            App.globalPut(self.Variables.coffeeCount, App.globalGet(self.Variables.coffeeCount) + Btoi(coffee)),
            Approve()
        ])

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.application_args[0] == self.AppMethods.buyCoffee, self.buyCoffee()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
