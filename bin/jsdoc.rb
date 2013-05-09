# Helper code for jsdoc2json

def comment_block(code)
    return %r{(/\*\*.*?\*/)}m.match(code).to_a[1]
end

def function_signature(code)
    return %r{\*/\s*(.*)\s*\{}m.match(code).to_a[1]
end

def name(sig)
    return (sig =~ /=/ ? 
        %r{(\S+)\s*=\s*function} :
        %r{function\s*(\S+)}).match(sig).to_a[1]
end

def args(sig)
    return /function.*\((.*)\)/.match(sig).to_a[1].split(/\s*,\s*/)
end

def tags(jsdoc_block)
    jsdoc_tags = {}
    jsdoc_block.scan(/(@.*?\n)/).flatten.each { |tag|
        (_, name, value) = %r{@(.*):\s*(.*)\s*\r}.match(tag).to_a
        jsdoc_tags[name] = value
    }
    return jsdoc_tags
end
