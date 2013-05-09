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
        %r{(/\*\*.*?\*/)}m.match(code).to_a[1]
    end

    def function_signature(code)
        %r{\*/\s*(.*)\s*\{}m.match(code).to_a[1]
    end

    def name(sig)
        puts sig
        (sig =~ /=/ ? 
            %r{(\S+)\s*=\s*function} :
            %r{function\s*(\S+)\s*\(}).match(sig).to_a[1]
    end

    def args(sig)
        /function.*\((.*)\)/.match(sig).to_a[1].split(/\s*,\s*/)
    end

    def tags(jsdoc_block)
        jsdoc_block.scan(/(@.*?\n)/).flatten.map { |tag|
            (_, name, value) = %r{@(.*):\s*(.*)\s*\r}.match(tag).to_a[2]
        }
        
    end

end
