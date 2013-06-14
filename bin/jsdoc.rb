# Helper code for jsdoc2json

class JSDoc

    def initialize(sourcecode)
        @sourcecode = sourcecode

        # Extract relevant blocks of code (a jsdoc comment block and the following
        # function signature)
        @blocks = @sourcecode.scan(%r{(/\*\*.*?\*/.*?function.*?\n)}m).flatten

    end

    def spec
        @blocks.map { |block|

            { 
                :signature => function_signature(block),
                :name => name(function_signature(block)),
                :args => args(function_signature(block)),
                :tags => tags(comment_block(block))
            }

        }
    end

    def comment_block(code)
        code[%r{/\*\*.*?\*/}m]
    end

    def function_signature(code)
        code[%r{\*/\s*(.*)\s*\{}m,1]
    end

    def name(sig)
        # Okay, this one got out of hand..
        return sig[( 
            sig =~ /=/ ?  
            %r{\.([^\s\.]+)\s*=\s*function} 
            : 
            %r{function\s*(\S+)\s*\(}
            ),1
        ]
    end

    def args(sig)
        sig[/function.*\((.*)\)/,1].split(/\s*,\s*/)
    end

    def tags(jsdoc_block)
        # Return a hash where keys are jsdoc tag labels, and values are the rest of the line.
        thash = {};
        jsdoc_block.scan(/(@.*?\n)/).flatten.map { |tag|
            _, name, value = %r{@(\w*)\W*(.*)\s*\r}.match(tag).to_a
            thash[name] = value
        }
        return thash
        
    end

end
