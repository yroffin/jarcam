# Intro

Just a simple tool to generate gcode from STL

# Online site

See on aws : http://jarcam.s3-website.eu-west-3.amazonaws.com

# Roadmap

Add this feature :
- add drawing feature
    - create a tool path along the outside of a closed shape
    - create a tool path along internal closed shape
    - create a drill model
    - select cnc program origin (add it to 3D viewer)
- add tool set
    - tool diameter
    - depth per pass
        - for raw cutting
        - for fine cutting
    - plunge
        - angle
        - feedrate
    - regular machining speed
    - cutting speed
    - rpm tool speed
    - lateral distance in % of tool diameter
    - trochoidal
        - step depth
        - step length
        - z oscillation
    - pointer
        - angle
        - center offset
        - tip offset
        - edge radius
- parameters
    - add gcode post/processor (for now only marlin)
        - gcode begin / end script
    - clearance plane
